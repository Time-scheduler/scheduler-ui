import React from 'react';
import { withRouter } from 'react-router-dom';
import TaskView from './tasks-view';
import axios from 'axios';
import moment from 'moment';
var currentWeekNumber = require('current-week-number');

class TasksControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: this.props.currentDate,
      results: [],
      pickerVisible: false,
      newTaskVisible: false,
      hours: 0,
      color: "blue",
      errorMsg: '',
      tasks: [],
      appointments: []
    };
    console.log("Date: " + this.state.currentDate)

    this.retrieveTasks = this.retrieveTasks.bind(this);
    this.handleHoursChange = this.handleHoursChange.bind(this);
    this.onNewTaskDialog = this.onNewTaskDialog.bind(this);
    this.onTogglePicker = this.onTogglePicker.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.onFormChange= this.onFormChange.bind(this);
    this.handleCreateTask= this.handleCreateTask.bind(this);
    this.onDeleteTask= this.onDeleteTask.bind(this);
  }

  async componentDidMount(){
    await this.retrieveTasks(this.state.currentDate);
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.currentDate !== this.props.currentDate) {
      await this.retrieveTasks(this.props.currentDate);
    }
  }

  handleCreateTask = () => {
    console.log("name: " + this.state.name)
    console.log("hours: " + this.state.hours)
    console.log("color: " + this.state.color)
    var errorMsg = null
      if ((!('name' in this.state)) || this.state.name === null || this.state.name === '') {
        errorMsg = "Please specify a task name."
      }
      if ((!('hours' in this.state)) || this.state.hours === null || this.state.hours === '' || this.state.hours < 0) {
        errorMsg = "Please specify the number of hours to spend on the task."
      }
      if ((!('color' in this.state)) || this.state.color === null || this.state.color === '') {
        errorMsg = "Please specify a color."
      }
  if (errorMsg !== null) {
    this.setState({errorMsg: errorMsg})
  } else {
    var week = currentWeekNumber(moment(this.props.currentDate).add(1, 'day').format('MM/DD/YYYY'))
    var year = this.props.currentDate.getFullYear()

    console.log("week: " + week)
    console.log("year: " + year)
    var body = {name: this.state.name, week: week, year: year, color: this.state.color, hours: this.state.hours}

    fetch('http://time-tracker.eastus.cloudapp.azure.com:3000/api/tasks/create', {
      method: 'POST',
      headers: {
    'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
      },

      body: JSON.stringify(body),
    })
    .then(response => {
        return response.json()
    })
    .then(resJson => {
      if ('error' in resJson) {
        this.setState({errorMsg: resJson.error})
      } else if ('name' in resJson) {
        console.log("Res of create: " + resJson)
      } else {
        this.setState({errorMsg: 'Unknown error. Please contact developers.'})
      }
    })
    .catch(error => {
      console.log(error);
    });}
  };

  onNewTaskDialog = () => this.setState({ newTaskVisible: !this.state.newTaskVisible })
  onTogglePicker = () => this.setState({ pickerVisible: !this.state.pickerVisible })
  handleColorChange = ({ hex }) => {this.setState({ color: hex }); console.log(this.state.color)}

  handleHoursChange = (value) => {
    console.log("Value: ", value.target.value)
    this.setState({ hours: value.target.value })
  };

  onDeleteTask = (e, task) => {
    fetch(`http://time-tracker.eastus.cloudapp.azure.com:3000/api/tasks/${task._id}`,
    {
        method: 'DELETE',
        'headers': {'token': localStorage.getItem('token')}
    })
      .then(response => {
          return response.json()
      })
      .then(json => {
  if ('taskId' in json) {
          this.props.onUpdateApp()
          this.setState({tasks: this.state.tasks.filter(function(t) {
            return json.taskId !== t._id
    })})
  }
        if ('error' in json) {
          this.setState({errorMsg: json.error})
        }
      })
  }

  onFormChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  retrieveTasks(date) {
    var week = currentWeekNumber(moment(date).add(1, 'day').format('MM/DD/YYYY'))
    var year = date.getFullYear()

    console.log("Calculated week: " + week)
    console.log("Calculated year: " + year)

    axios.get(`http://time-tracker.eastus.cloudapp.azure.com:3000/api/appointments?week=${week}&year=${year}`,
      {'headers': {'token': localStorage.getItem('token')}})
      .then(({ data }) => {
        this.setState({appointments: data});
        axios.get(`http://time-tracker.eastus.cloudapp.azure.com:3000/api/tasks?week=${week}&year=${year}`,
          {'headers': {'token': localStorage.getItem('token')}})
          .then(({ data }) => {
            console.log("TASKDATA axios: "+ JSON.stringify(data));
            for (var i = 0; i < data.length; i++) {
              var id = data[i]._id
              var appointments = this.state.appointments
              data[i].spent = 0
              for (var j = 0; j < appointments.length; j++) {
                if (appointments[j].taskId === id) {
                  var endDate = moment(appointments[j].endDate)
                  var startDate = moment(appointments[j].startDate)
                  var diff = endDate.diff(startDate)
                  data[i].spent += moment.duration(diff).asHours()
                }
              }
            }

            console.log("FINAL " + JSON.stringify(data))
            this.setState({tasks: data});
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 404) {
                this.setState({tasks: []});
              }
            }
          })
      })
      .catch(error => {
        if (error.response) {
          if (error.response.status === 404) {
            this.setState({appointments: []});
          }
        }
      })
  }

  render() {
    return (
      <TaskView tasks={this.state.tasks} pickerVisible={this.state.pickerVisible}
        onNewTaskDialog={this.onNewTaskDialog} handleCreateTask={this.handleCreateTask}
        newTaskVisible={this.state.newTaskVisible} handleHoursChange={this.handleHoursChange}
        hours={this.state.hours} onTogglePicker={this.onTogglePicker} handleColorChange={this.handleColorChange}
        color={this.state.color} onFormChange={this.onFormChange} errorMsg={this.state.errorMsg} deleteTask={this.onDeleteTask}
      />
    );
  }
}

export default withRouter(TasksControl);
