import React from 'react';
import {Appointments, AppointmentTooltip, AppointmentForm} from '@devexpress/dx-react-scheduler-material-ui';
import { TimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Notes from '@material-ui/icons/Notes';
import Close from '@material-ui/icons/Close';
import CalendarToday from '@material-ui/icons/CalendarToday';
import Create from '@material-ui/icons/Create';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import moment from 'moment';
const currentWeekNumber = require('current-week-number');

import styles from './appointments-styles';

class AppointmentFormContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      appointmentChanges: {},
      newEventTask: '',
      startTime: '07:30',
      endTime: '08:30',
      eventDate: '',
      errorMsg: ''
    };

    this.getAppointmentData = () => {
      const { appointmentData } = this.props;
      return appointmentData;
    };
    this.getAppointmentChanges = () => {
      const { appointmentChanges } = this.state;
      return appointmentChanges;
    };

    this.changeAppointment = this.changeAppointment.bind(this);
    this.commitAppointment = this.commitAppointment.bind(this);
    this.handleEventTaskChange = this.handleEventTaskChange.bind(this);
    this.handleEventTimeChange = this.handleEventTimeChange.bind(this);
  }

  handleEventTaskChange = (value) => {
    console.log("Value: ", value.target.value)
    this.setState({ newEventTask: value.target.value })
    this.changeAppointment({field: 'taskId', changes: value.target.value})
  };

  handleEventTimeChange = (value) => {
    var key = value.target.id || value.target.name
    var val = value.target.value
    this.setState({ [key]: val })
    var eventDate = null
    var startTime = null
    var endTime  = null
    if (key == 'eventDate') {
      eventDate = val
    } else if (this.state.eventDate !== null && this.state.eventDate !== '') {
      eventDate = this.state.eventDate
    }

    if (key == 'startTime') {
      startTime = val
    } else if (this.state.startTime !== null && this.state.startTime !== '') {
      startTime = this.state.eventDate
    }

    if (key == 'endTime') {
      endTime = val
    } else if (this.state.endTime !== null && this.state.endTime !== '') {
      endTime = this.state.eventDate
    }

    if (eventDate !== null && startTime !== null && endTime !== null) {
      var startDate = moment(eventDate + " " + this.state.startTime, "dddd, MMM D HH:mm").utc().format("YYYY-MM-DD HH:mm:ss")
      var endDate = moment(eventDate + " " + this.state.endTime, "dddd, MMM D HH:mm").utc().format("YYYY-MM-DD HH:mm:ss")
      console.log("MY START DATE: " + JSON.stringify(startDate))
      console.log("MY END DATE: " + JSON.stringify(endDate))
      this.changeAppointment({field: 'startDate', changes: startDate, otherField: 'endDate', otherChanges: endDate})
    }
  };

  changeAppointment({ field, changes, otherField=null, otherChanges=null }) {
    var nextChanges = {}
    if (otherField !== null && otherChanges !== null) {
      nextChanges = {
        ...this.getAppointmentChanges(),
        [field]: changes,
        [otherField]: otherChanges,
      };
    } else {
      nextChanges = {
        ...this.getAppointmentChanges(),
        [field]: changes,
      };
    }
    this.setState({
      appointmentChanges: nextChanges,
    });
    console.log("field: "+field+ " changes: " + changes)
    console.log("nextChanges: "+JSON.stringify(nextChanges))
    console.log("Changes: "+JSON.stringify(this.state.appointmentChanges))
  }

  commitAppointment(type) {
    console.log("Data: "+JSON.stringify(this.props.appointmentData))
    console.log("Changes: "+JSON.stringify(this.state.appointmentChanges))
    const { commitChanges } = this.props;
    const appointment = {
      ...this.getAppointmentData(),
      ...this.getAppointmentChanges(),
    };
    var errorMsg = null
    if (type === 'added') {
      if ((!('startDate' in appointment)) || appointment.startDate === null || appointment.startDate === '') {
        errorMsg = "Please select a date and time of the event."
      }
      if ((!('endDate' in appointment)) || appointment.endDate === null || appointment.endDate === '') {
        errorMsg = "Please select a date and time of the event."
      }
      if ((!('title' in appointment)) || appointment.title === null || appointment.title === '') {
        errorMsg = "Please specify a title."
      }
      if ((!('taskId' in appointment)) || appointment.taskId === null
          || appointment.taskId === '' || appointment.taskId === 'None') {
        errorMsg = "Please select a task or create a new one."
      }
    }
    if (errorMsg !== null) {
      this.setState({errorMsg: errorMsg})
    } else {
      commitChanges({
        [type]: type === 'deleted' ? appointment._id : appointment,
      });
      this.setState({
        appointmentChanges: {},
        newEventTask: '',
        startTime: '07:30',
        endTime: '08:30',
        eventDate: '',
        errorMsg: '',
      });
      this.props.visibleChange();
    }
  }

  render() {
    const { classes, visible, visibleChange, appointmentData, tasks, currentDate } = this.props;
    const { appointmentChanges } = this.state;
    console.log("PROPS: " + JSON.stringify(this.props.appointmentData))

    const displayAppointmentData = {
      ...appointmentData,
      ...appointmentChanges,
    };

    const isNewAppointment = appointmentData._id === undefined;
    const applyChanges = isNewAppointment
      ? () => this.commitAppointment('added')
      : () => this.commitAppointment('changed');

    const textEditorProps = field => ({
      variant: 'outlined',
      onChange: ({ target }) => this.changeAppointment({ field: [field], changes: target.value }),
      value: displayAppointmentData[field] || '',
      label: field[0].toUpperCase() + field.slice(1),
      className: classes.textField,
    });

    const pickerEditorProps = field => ({
      className: classes.picker,
      keyboard: true,
      value: displayAppointmentData[field],
      onChange: date => this.changeAppointment({ field: [field], changes: date.toDate() }),
      variant: 'outlined',
      format: 'DD/MM/YYYY HH:mm',
      mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/],
    });

    var tasksItems = []
    for (var i = 0; i < tasks.length; i++) {
      tasksItems.push(
        <MenuItem value={tasks[i]._id} key={tasks[i].name}>{tasks[i].name}</MenuItem>
      )
    }
    var week = currentWeekNumber(moment(currentDate).add(1, 'day').format('MM/DD/YYYY'))

    console.log("Calculated week: " + week)
    var first = moment().day("Sunday").week(week)
    var dateItems = []
    for (var j = 0; j < 7; j++) {
      var date = first.clone().format('dddd, MMM D')
      dateItems.push(
        <MenuItem value={date} key={date}>{date}</MenuItem>
      )
      first.add(1, 'day')
    }

    return (
      <AppointmentForm.Popup
        visible={visible}
        onBackdropClick={visibleChange}
      >
        <AppointmentForm.Container className={classes.container}>
          <div className={classes.header}>
            <IconButton className={classes.closeButton} onClick={visibleChange}>
              <Close color="action" />
            </IconButton>
          </div>
          <div className={classes.content}>
            <div className={classes.wrapper}>
              <Create className={classes.icon} color="action" />
              <TextField
                {...textEditorProps('title')}
              />
            </div>
            <div className={classes.wrapper}>
              <CalendarToday className={classes.icon} color="action" />

              <div className={classes.wrapper}>
                <InputLabel htmlFor="task-simple">Date</InputLabel>
                <Select className={classes.selectField}
                        value={this.state.eventDate}
                        onChange={this.handleEventTimeChange}
                        inputProps={{name: 'eventDate', id: 'eventDate'}}
                >
                  {dateItems}
                </Select>
              </div>
              <TextField
                id="startTime"
                label="Start time"
                type="time"
                defaultValue="07:30"
                value={this.state.startTime}
                className={classes.timeField}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 600, // 5 min
                }}
                onChange={this.handleEventTimeChange}
              />
              <TextField
                id="endTime"
                label="End time"
                type="time"
                defaultValue="08:30"
                className={classes.timeField}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 600, // 5 min
                }}
              />
            </div>
            <div className={classes.wrapper}>
              <InputLabel htmlFor="task-simple">Task</InputLabel>
              <Select className={classes.selectField}
                value={this.state.newEventTask}
                onChange={this.handleEventTaskChange}
                inputProps={{
                  name: 'taskId',
                  id: 'task-simple',
                }}
              >
                <MenuItem value='None' key='none'>None</MenuItem>
                {tasksItems}
              </Select>
              <FormHelperText>Select task</FormHelperText>
            </div>
            <div className={classes.wrapper}>
              <Notes className={classes.icon} color="action" />
              <TextField
                {...textEditorProps('notes')}
                multiline
                rows="6"
              />
            </div>
          </div>
          <div className={classes.buttonGroup}>
            {!isNewAppointment && (
              <Button
                variant="outlined"
                color="secondary"
                className={classes.button}
                onClick={() => {
                  visibleChange();
                  this.commitAppointment('deleted');
                }}
              >
                Delete
              </Button>
            )}
      {this.state.errorMsg !== ''
        ? (<font color="red">{this.state.errorMsg}</font>) : (<p/>)}
            <Button
              variant="outlined"
              color="primary"
              className={classes.button}
              onClick={(e) => {
                e.preventDefault()
                applyChanges();
              }}
            >
              {isNewAppointment ? 'Create' : 'Save'}
            </Button>
          </div>
        </AppointmentForm.Container>
      </AppointmentForm.Popup>
    );
  }
}

export default withStyles(styles)(AppointmentFormContainer);
              /*<MuiPickersUtilsProvider utils={MomentUtils}>
                <TimePicker
                  label="Start Time"
                  {...pickerEditorProps('startDate')}
                />
                <TimePicker
                  label="End Time"
                  {...pickerEditorProps('endDate')}
                />
              </MuiPickersUtilsProvider>*/
