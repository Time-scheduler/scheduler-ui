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
    var week = currentWeekNumber(this.props.currentDate)
    var year = this.props.currentDate.getFullYear()

    console.log("week: " + week)
    console.log("year: " + year)
    var body = {name: this.state.name, week: week, year: year, color: this.state.color, hours: this.state.hours}

    fetch('http://localhost:3000/api/tasks/create', {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
      },

      body: JSON.stringify(body),
      mode: 'cors'
    })
    .then(response => {
        return response.json()
    })
    .then(resJson => {
      if ('error' in resJson) {
        this.setState({errorMsg: resJson.error})
      } else {
        this.setState({errorMsg: 'Unknown error. Please contact developers.'})
      }
    })
    .catch(error => {
      console.log(error);
    });
  };

  onNewTaskDialog = () => this.setState({ newTaskVisible: !this.state.newTaskVisible })
  onTogglePicker = () => this.setState({ pickerVisible: !this.state.pickerVisible })
  handleColorChange = ({ hex }) => {this.setState({ color: hex }); console.log(this.state.color)}

  handleHoursChange = (value) => {
    console.log("Value: ", value.target.value)
    this.setState({ hours: value.target.value })
  };

  onFormChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  retrieveTasks(date) {
    var week = currentWeekNumber(date)
    var year = date.getFullYear()

    console.log("Calculated week: " + week)
    console.log("Calculated year: " + year)

    axios.get(`http://localhost:3000/api/appointments?week=${week}&year=${year}`,
      {'headers': {'token': localStorage.getItem('token')}})
      .then(({ data }) => {
        this.setState({appointments: data});
        axios.get(`http://localhost:3000/api/tasks?week=${week}&year=${year}`,
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
                  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! "+JSON.stringify(endDate))
                  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! "+JSON.stringify(startDate))
                  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! "+JSON.stringify(moment.duration(diff).asHours()))
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
        color={this.state.color} onFormChange={this.onFormChange} errorMsg={this.state.errorMsg}
      />
    );
  }
}

export default withRouter(TasksControl);
