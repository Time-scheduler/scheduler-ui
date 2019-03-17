import React from 'react';
import {Appointments, AppointmentTooltip, AppointmentForm} from '@devexpress/dx-react-scheduler-material-ui';
import { InlineDateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
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

import styles from './appointments-styles';

class AppointmentFormContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      appointmentChanges: {},
      newEventTask: '',
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
  }

  handleEventTaskChange = (value) => {
    console.log("Value: ", value.target.value)
    this.setState({ newEventTask: value.target.value })
    this.changeAppointment({field: 'taskId', changes: value.target.value})
  };

  changeAppointment({ field, changes }) {
    const nextChanges = {
      ...this.getAppointmentChanges(),
      [field]: changes,
    };
    this.setState({
      appointmentChanges: nextChanges,
    });
    console.log("field: "+field+ " changes: " + changes)
    console.log("nextChanges: "+nextChanges)
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
    commitChanges({
      [type]: type === 'deleted' ? appointment._id : appointment,
    });
    this.setState({
      appointmentChanges: {},
    });
  }

  render() {
    const { classes, visible, visibleChange, appointmentData, tasks } = this.props;
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
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <InlineDateTimePicker
                  label="Start Date"
                  {...pickerEditorProps('startDate')}
                />
                <InlineDateTimePicker
                  label="End Date"
                  {...pickerEditorProps('endDate')}
                />
              </MuiPickersUtilsProvider>
            </div>
            <div className={classes.wrapper}>
              <InputLabel htmlFor="task-simple">Task</InputLabel>
              <Select
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
            <Button
              variant="outlined"
              color="primary"
              className={classes.button}
              onClick={() => {
                visibleChange();
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
