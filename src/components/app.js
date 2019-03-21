import React from 'react';
import {render} from 'react-dom';
import Paper from '@material-ui/core/Paper';
import {ViewState, EditingState} from '@devexpress/dx-react-scheduler';
import {Scheduler, WeekView, Appointments, Toolbar, AppointmentTooltip,
  AppointmentForm, DateNavigator} from '@devexpress/dx-react-scheduler-material-ui';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import {blue} from '@material-ui/core/colors';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import TasksControl from './tasks/tasks-control';
import PopUp from './pop-up';
import ProfileControl from './profile/profile-control';
import { connectProps } from '@devexpress/dx-react-core';
import { InlineDateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Notes from '@material-ui/icons/Notes';
import AccessTime from '@material-ui/icons/AccessTime';
import axios from 'axios';
import moment from 'moment';
import AppointmentFormContainer from './appointments'
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { lighten } from '@material-ui/core/styles/colorManipulator';

const currentWeekNumber = require('current-week-number');

const theme = createMuiTheme({palette: {type: 'light', primary: blue}});

const TooltipHeader = withStyles(styles, { name: 'TooltipHeader' })(
  ({ classes, style, appointmentData, ...restProps }) => {
    return (
      <AppointmentTooltip.Header
        style={{
          ...style,
          background: appointmentData.color,
          '&:button.edit-button': { background: lighten(appointmentData.color, 0.15) }
        }}
        {...restProps}
        appointmentData={appointmentData}
      />
    );
  },
);
const TooltipContent = withStyles(styles, { name: 'TooltipContent' })(
  ({ classes, appointmentData, ...restProps }) => {
    console.log(appointmentData.startDate)
    return (
      <AppointmentTooltip.Content {...restProps} className={classes.tooltipContent}>
        <List>
          <ListItem>
            <ListItemIcon>
              <AccessTime />
            </ListItemIcon>
            <ListItemText>
                {moment(appointmentData.startDate).format('h:mm A')}
                {' - '}
                {moment(appointmentData.endDate).format('h:mm A')}
            </ListItemText>
          </ListItem>
          {appointmentData.notes !== ''
            ? (<ListItem>
              <ListItemIcon>
                <Notes/>
              </ListItemIcon>
              <ListItemText>
                {appointmentData.notes}
              </ListItemText>
            </ListItem>)
            : (<p/>)
          }
        </List>
      </AppointmentTooltip.Content>
    );
  },
);

const Appointment = withStyles(styles, { name: 'Appointment' })(
  ({children, style, data, ...restProps}) => {

  return (
  <Appointments.Appointment
    {...restProps}
    style={{
      ...style,
      borderRadius: '8px',
      backgroundColor: data.color,
    }}
    data={data}
  >
    {children}
  </Appointments.Appointment>
);})

const styles = theme => ({
  addButton: {
    position: 'absolute',
    bottom: theme.spacing.unit * 5,
    left: '62%',
  },
});

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      currentDate: new Date(),
      loggedIn: localStorage.getItem("token") !== null,
      confirmationVisible: false,
      editingFormVisible: false,
      deletedAppointmentId: undefined,
      editingAppointmentId: undefined,
      addedAppointment: {},
      startDayHour: 0,
      endDayHour: 24,
      tasks: [],
      errorMsg: '',
      popUpMsg: '',
      showPopUp: false
    };
    this.currentDateChange = (currentDate) => {
      this.setState({currentDate});
      this.retrieveAppointments(currentDate);
    };
    this.toggleConfirmationVisible = this.toggleConfirmationVisible.bind(this);
    this.commitDeletedAppointment = this.commitDeletedAppointment.bind(this);
    this.toggleEditingFormVisibility = this.toggleEditingFormVisibility.bind(this);

    this.commitChanges = this.commitChanges.bind(this);
    this.onEditingAppointmentIdChange = this.onEditingAppointmentIdChange.bind(this);
    this.onAddedAppointmentChange = this.onAddedAppointmentChange.bind(this);
    this.retrieveTasks = this.retrieveTasks.bind(this);
    this.onNewEvent = this.onNewEvent.bind(this);
    this.retrieveAppointments = this.retrieveAppointments.bind(this);
    this.createAppointment = this.createAppointment.bind(this);
    this.onUpdateApp = this.onUpdateApp.bind(this);
    this.handleClosePopUp = this.handleClosePopUp.bind(this);

    this.appointmentForm = connectProps(AppointmentFormContainer, () => {
      const {
        editingFormVisible, editingAppointmentId, data, addedAppointment,
      } = this.state;

      const currentAppointment = data
        .filter(appointment => appointment._id === editingAppointmentId)[0] || addedAppointment;

      return {
        visible: editingFormVisible,
        appointmentData: currentAppointment,
        tasks: this.state.tasks,
        commitChanges: this.commitChanges,
        visibleChange: this.toggleEditingFormVisibility,
        onEditingAppointmentIdChange: this.onEditingAppointmentIdChange,
        currentDate: this.state.currentDate,
      };
    });
  }

  handleClosePopUp = () => {
    this.setState({ popUpMsg: '' })
    this.setState({ showPopUp: false })
  }

  onUpdateApp() {
    //await this.retrieveTasks(this.state.currentDate);
    console.log("C++++++++++++++++++++== onUpdateApp")
    this.retrieveAppointments(this.state.currentDate);
  }

  async componentDidMount(){
    //await this.retrieveTasks(this.state.currentDate);
    await this.retrieveAppointments(this.state.currentDate);
  }

  retrieveAppointments(date) {
    var week = currentWeekNumber(moment(date).add(1, 'day').format('MM/DD/YYYY'))
    var year = date.getFullYear()

    console.log("Calculated week: " + week)
    console.log("Calculated year: " + year)
    var tasks = []

    axios.get(`http://localhost:3000/api/tasks?week=${week}&year=${year}`,
      {'headers': {'token': localStorage.getItem('token')}})
      .then(({ data }) => {
        //console.log("axios: "+ JSON.stringify(data));
        if (data) {
          tasks = data
        }
        axios.get(`http://localhost:3000/api/appointments?week=${week}&year=${year}`,
          {'headers': {'token': localStorage.getItem('token')}})
          .then(({ data }) => {
            if (data) {
              for (var i = 0; i < data.length; i++) {
                var color = 'blue'
                var taskId = data[i].taskId
                for (var j = 0; j < tasks.length; j++) {
                  if (tasks[j]._id == taskId) {
                    color = tasks[j].color
                  }
                }
                data[i].color = color
                data[i].id = data[i]._id
                data[i].startDate = new Date(data[i].startDate)
                data[i].endDate = new Date(data[i].endDate)
              }

              for (var i = 0; i < tasks.length; i++) {
                var id = tasks[i]._id
                var appointments = data
                tasks[i].spent = 0
                for (var j = 0; j < appointments.length; j++) {
                  if (appointments[j].taskId === id) {
                    var endDate = moment(appointments[j].endDate)
                    var startDate = moment(appointments[j].startDate)
                    var diff = endDate.diff(startDate)
                    tasks[i].spent += moment.duration(diff).asHours()
                  }
                }
              }
              this.setState({data: data, tasks: tasks});
            } else {
                this.setState({data: []});
            }
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 404) {
                this.setState({data: []});
              }
            }
          })
      })
      .catch(error => {
        if (error.response) {
          if (error.response.status === 404) {
            this.setState({tasks: []});
          }
        }
      })
  }

  componentDidUpdate() {
    this.appointmentForm.update();
  }

  onEditingAppointmentIdChange(editingAppointmentId) {
    console.log("EDITING APPOINTMENT: " + editingAppointmentId)
    this.setState({ editingAppointmentId });
  }

  onAddedAppointmentChange(e, addedAppointment) {
    e.preventDefault()
    console.log("ADDED APPOINTMENT: " + addedAppointment)
    this.setState({ addedAppointment });
    this.onEditingAppointmentIdChange(undefined);
  }

  setDeletedAppointmentId(_id) {
    this.setState({ deletedAppointmentId: _id });
  }

  toggleEditingFormVisibility(e) {
    const { editingFormVisible } = this.state;
    this.setState({
      editingFormVisible: !editingFormVisible,
    });
  }

  toggleConfirmationVisible() {
    const { confirmationVisible } = this.state;
    this.setState({ confirmationVisible: !confirmationVisible });
  }

  commitDeletedAppointment() {
    const { data, deletedAppointmentId } = this.state;
      fetch(`http://localhost:3000/api/appointments/${deletedAppointmentId}`,
        {
            method: 'DELETE',
            'headers': {'token': localStorage.getItem('token')}
        })
        .then(response => {
          if (response.status === 201) {
            this.retrieveAppointments(this.state.currentDate)
          }
            return response.json()
        })
        .then(json => {
          if ('error' in json) {
            this.setState({errorMsg: json.error})
          } else {
            this.setState({results: json});
          }
        })
      this.setState({ deletedAppointmentId: null });
      this.toggleConfirmationVisible();
  }

  createAppointment(added) {
    fetch('http://localhost:3000/api/appointments/create', {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
      },

      body: JSON.stringify(added),
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
  }

  commitChanges({ added, changed, deleted }) {
    let { data } = this.state;
    if (added) {
      const startingAddedId = data.length > 0 ? data[data.length - 1]._id + 1 : 0;
      console.log("Added: " + JSON.stringify(added))
      this.createAppointment(added)
    }
    if (changed) {
      console.log("Changed: " + JSON.stringify(changed))
      data = data.map(appointment => (
        changed._id === appointment._id ? { ...appointment, ...changed } : appointment));
    }
    if (deleted !== undefined) {
      this.setDeletedAppointmentId(deleted);
      this.toggleConfirmationVisible();
    }
    this.setState({ data, addedAppointment: {} });
    this.retrieveAppointments(this.state.currentDate)
  }

  retrieveTasks(date) {
    var week = currentWeekNumber(moment(date).add(1, 'day').format('MM/DD/YYYY'))
    var year = date.getFullYear()

    console.log("Calculated week: " + week)
    console.log("Calculated year: " + year)


    axios.get(`http://localhost:3000/api/tasks?week=${week}&year=${year}`,
      {'headers': {'token': localStorage.getItem('token')}})
      .then(({ data }) => {
        //console.log("axios: "+ JSON.stringify(data));
        this.setState({tasks: data});
      })
      .catch(error => {
        if (error.response) {
          if (error.response.status === 404) {
            this.setState({tasks: []});
          }
        }
      })
  }
  onNewEvent = (e) => {
    e.preventDefault()
    if (localStorage.getItem('token') !== null && localStorage.getItem('token') !== '') {
      //this.retrieveTasks(this.state.currentDate)
      this.retrieveAppointments(this.state.currentDate)
      this.setState({ editingFormVisible: true });
      this.onEditingAppointmentIdChange(undefined);

    } else {
      this.setState({popUpMsg: 'Please log in to create new events.'});
      this.setState({showPopUp: true});
    }
  }

  onLoginChange = () => {
    this.setState({ loggedIn: localStorage.getItem("token") !== null})
  }

  render() {
    console.log("APP tasks: " + JSON.stringify(this.state.tasks))
    console.log("APP appointments: " + JSON.stringify(this.state.appointments))
    const {
      currentDate,
      data,
      confirmationVisible,
      editingFormVisible,
      startDayHour,
      endDayHour,
    } = this.state;
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
      <span style={{float:'left', width: '70%'}}>
        <Paper>
          {this.state.loggedIn
            ? (<Scheduler data={data} style={{color: 'red'}}>
            <ViewState
              currentDate={currentDate}
              onCurrentDateChange={this.currentDateChange}
            />
            <WeekView startDayHour={this.state.startDayHour} endDayHour={this.state.endDayHour} />
            <Toolbar />
            <DateNavigator />
            <EditingState
                    onCommitChanges={this.commitChanges}
                    onEditingAppointmentIdChange={this.onEditingAppointmentIdChange}
                    onAddedAppointmentChange={this.onAddedAppointmentChange}
            />
            <Appointments appointmentComponent={Appointment}/>
            <AppointmentTooltip
              headerComponent={TooltipHeader}
              contentComponent={TooltipContent}
              showOpenButton
              showCloseButton
              showDeleteButton
            />
            <AppointmentForm
              popupComponent={this.appointmentForm}
              visible={editingFormVisible}
              onVisibilityChange={this.toggleEditingFormVisibility}
            />
          </Scheduler>)
            : (<Scheduler style={{color: 'red'}}>
            <ViewState
              currentDate={currentDate}
              onCurrentDateChange={this.currentDateChange}
            />
            <WeekView startDayHour={this.state.startDayHour} endDayHour={this.state.endDayHour} />
            <Toolbar />
            <DateNavigator />
          </Scheduler>)}
          <Dialog
            open={confirmationVisible}
            onClose={this.cancelDelete}
          >
            <DialogTitle>
              Delete Appointment
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this appointment?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.toggleConfirmationVisible} color="primary" variant="outlined">
                Cancel
              </Button>
              <Button onClick={this.commitDeletedAppointment} color="secondary" variant="outlined">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <Fab
            color="secondary"
            size='small'
            className={classes.addButton}
            onClick={this.onNewEvent}
          >
          <AddIcon />
        </Fab>
        </Paper>
      </span>
      <span style={{float:'right', width: '30%'}}>
        <Router>
          <Switch>
            <Route
              exact
              path="/"
              render={props => (
                <React.Fragment>
                  <ProfileControl onLoginChange={this.onLoginChange} {...props} />
                  {this.state.loggedIn
                    ? (<TasksControl currentDate={currentDate} tasks={this.state.tasks} onUpdateApp={this.onUpdateApp} appointments={this.state.data} {...props} />)
                    : (
                        <Typography component="div" variant="h6" style = {{marginTop: '50px', }} align='center'>
                            Please log in to see and create tasks.
                        </Typography>
                      )
                  }
                </React.Fragment>
              )}
            />
          </Switch>
        </Router>
      </span>
      <PopUp message={this.state.popUpMsg} showPopUp={this.state.showPopUp} handleClosePopUp={this.handleClosePopUp}/>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
