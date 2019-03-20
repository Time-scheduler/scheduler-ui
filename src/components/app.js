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
import ProfileControl from './profile/profile-control';
import { connectProps } from '@devexpress/dx-react-core';
import { InlineDateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import LocationOn from '@material-ui/icons/LocationOn';
import Notes from '@material-ui/icons/Notes';
import Close from '@material-ui/icons/Close';
import CalendarToday from '@material-ui/icons/CalendarToday';
import Create from '@material-ui/icons/Create';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import axios from 'axios';
import moment from 'moment';
import AppointmentFormContainer from './appointments'

const currentWeekNumber = require('current-week-number');

const theme = createMuiTheme({palette: {type: 'light', primary: blue}});

const TooltipHeader = withStyles(styles, { name: 'TooltipHeader' })(
  ({ classes, style, appointmentData, ...restProps }) => {
    return (
      <AppointmentTooltip.Header
        style={{
          ...style,
          backgroundColor: appointmentData.color,
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
              {moment(appointmentData.startDate).format('h:mm A')}
              {' - '}
              {moment(appointmentData.endDate).format('h:mm A')}
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
      tasks: []
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
    this.onUpdateApp= this.onUpdateApp.bind(this);

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

  onUpdateApp() {
    this.retrieveAppointments(this.state.currentDate);
  }

  async componentDidMount(){
    await this.retrieveTasks(this.state.currentDate);
    await this.retrieveAppointments(this.state.currentDate);
  }

  retrieveAppointments(date) {
    var week = currentWeekNumber(moment(date).add(1, 'day').format('MM/DD/YYYY'))
    var year = date.getFullYear()

    console.log("Calculated week: " + week)
    console.log("Calculated year: " + year)

    axios.get(`http://time-tracker.eastus.cloudapp.azure.com:3000/api/tasks?week=${week}&year=${year}`,
      {'headers': {'token': localStorage.getItem('token')}})
      .then(({ data }) => {
        //console.log("axios: "+ JSON.stringify(data));
        if (data) {
          this.setState({tasks: data});
        } else {
          this.setState({tasks: []});
        }
        axios.get(`http://time-tracker.eastus.cloudapp.azure.com:3000/api/appointments?week=${week}&year=${year}`,
          {'headers': {'token': localStorage.getItem('token')}})
          .then(({ data }) => {
            if (data) {
              for (var i = 0; i < data.length; i++) {
                var color = 'blue'
                var taskId = data[i].taskId
                for (var j = 0; j < this.state.tasks.length; j++) {
                  if (this.state.tasks[j]._id == taskId) {
                    color = this.state.tasks[j].color
                  }
                }
                data[i].color = color
                data[i].id = data[i]._id
                data[i].startDate = new Date(data[i].startDate)
                data[i].endDate = new Date(data[i].endDate)
                console.log("======== START DATE ======= "+ JSON.stringify((data[i].startDate)))
                console.log("======== END DATE ======= "+ JSON.stringify((data[i].endDate)))
              }
              console.log("axios: "+ JSON.stringify(data));
              console.log("================TASKS" + this.state.tasks)
              this.setState({data: data});
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
    const nextData = data.filter(appointment => appointment._id !== deletedAppointmentId);
    this.setState({ data: nextData, deletedAppointmentId: null });
    this.toggleConfirmationVisible();
  }

  createAppointment(added) {
    console.log("========NEW APPOINTMENT DATA========" + JSON.stringify(added))
    fetch('http://time-tracker.eastus.cloudapp.azure.com:3000/api/appointments/create', {
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
      /*data = [
        ...data,
        {
          _id: startingAddedId,
          ...added,
        },
      ];*/
    }
    if (changed) {
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


    axios.get(`http://time-tracker.eastus.cloudapp.azure.com:3000/api/tasks?week=${week}&year=${year}`,
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
    this.retrieveTasks(this.state.currentDate)
    this.retrieveAppointments(this.state.currentDate)
    this.setState({ editingFormVisible: true });
    this.onEditingAppointmentIdChange(undefined);

    this.onAddedAppointmentChange({
      startDate: new Date(this.state.currentDate).setHours(this.state.startDayHour),
      endDate: new Date(this.state.currentDate).setHours(this.state.startDayHour + 1),
    });
  }

  onLoginChange = () => this.setState({ loggedIn: localStorage.getItem("token") !== null })

  render() {
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
          <Scheduler data={data} style={{color: 'red'}}>
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
          </Scheduler>
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
                    : (<div>Please log in to see the tasks</div>)}
                </React.Fragment>
              )}
            />
          </Switch>
        </Router>
      </span>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
