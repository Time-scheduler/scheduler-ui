import React from 'react';
import styles from './tasks-styles';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import { CirclePicker } from 'react-color'
import Input from '@material-ui/core/Input';

let fabStyle = function (clr) {
  return {
    position: 'relative',
    margin: '0px 10px 0px 5px',
    display: 'inline-block',
    width: '33px',
    height: '33px',
    borderRadius: '50%',
    color: '#fff',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: '0.2s',
    boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.26)',
    backgroundColor: clr,
  }
}

const colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
  "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
  "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#607D8B",
  '#7BDCB5', '#00D084', '#8ED1FC', '#ABB8C3',
  '#F78DA7', '#9900EF']

let Tasks = ({classes, tasks, pickerVisible, onNewTaskDialog, newTaskVisible,
    handleCreateTask, hours, handleHoursChange, onTogglePicker, color, handleColorChange, onFormChange,
    errorMsg, deleteTask}) => {
  console.log("I'm a task view")
  var hoursItems = [];
  for (var i = 1; i < 168; i++) {
      hoursItems.push(<MenuItem value={i} key={i}>{i}</MenuItem>);
  }
  var timeSpent = 0
  var tasksHours = 0
  for (var i = 0; i < tasks.length; i++) {
    timeSpent += (Math.round(tasks[i].spent * 10 ) / 10)
    tasksHours += tasks[i].hours
  }
  return (
    <div>
    <Paper style={{margin: '0px 10px 0px 10px', paddingTop: '50px'}}>
        <Table className={classes.table}>
      <Typography variant="h6"  className={'tableTitle'}>
        Tasks
      </Typography>
          <TableBody>
            {tasks ?
                tasks.map(task => (
                  <TableRow>
                    <Grid container spacing={8} alignItems="center">
                    <Grid item>
                    <div style={fabStyle(task.color)}></div>
                    </Grid>
                    <Grid item>
                    <b>{task.name}</b> | {task.hours - (Math.round(task.spent * 10 ) / 10) } / {task.hours} hours left
                    </Grid>
                    <Grid item>
                    <Fab size="small" aria-label="Delete" className={classes.fab} onClick={e => deleteTask(e, task)}>
                      <DeleteIcon />
                    </Fab>
                    </Grid>
                  </Grid>
                  </TableRow>
                  ))
            : ''}
          </TableBody>
        </Table>
        <div>
        <Fab size="small" color="primary" aria-label="Add" className={classes.fab} onClick={onNewTaskDialog}>
          <AddIcon />
        </Fab>

        <Dialog
          title="New Task"
          open={newTaskVisible}
          onBackdropClick={onNewTaskDialog}
        >
           <Paper className={classes.paper}>
              <Typography component="h1" variant="h5">
                 New Task
              </Typography>
              <form className={classes.form}>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="taskName">Task name</InputLabel>
                  <Input id="taskName" name="name" autoFocus onChange={onFormChange} />
                </FormControl>

                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="hours" shrink>Hours</InputLabel>
                  <Select
                    value={hours}
                    onChange={handleHoursChange}
                    inputProps={{name: 'hours', id: 'hours'}}
                  >
                  {hoursItems}
                  </Select>
                  <FormHelperText>Number of hours to spend per week</FormHelperText>
                </FormControl>

                <div style={{marginTop: 15}}>
                  <Typography>Choose color</Typography>
                  {(
                    <div style={{ marginTop: 15}}>
                      <CirclePicker
                        color={color} colors={colors}
                        onChangeComplete={handleColorChange}
                      />
                    </div>
                  )}
                </div>

                {errorMsg !== ''
                  ? (<Typography style={{color: "red"}}>{errorMsg}</Typography>) : (<p/>)}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                    onClick={e => handleCreateTask(e)}
                >
                 Create
                </Button>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    className={classes.submit}
                    onClick={onNewTaskDialog}
                >
                  Cancel
                </Button>
              </form>
            </Paper>
        </Dialog>
        </div>
    </Paper>
    <div>
      <Typography align='center'>
        You have {168 - timeSpent} / 168 hours free this week
      </Typography>
      <Typography align='center'>
        You can add tasks for {168 - tasksHours} / 168 more hours this week
      </Typography>
    </div>
    </div>
  );
};

export default withStyles(styles)(Tasks);
/*
  <Fab size="small" color="secondary" aria-label="Edit" className={classes.fab}>
    <EditIcon />
  </Fab>
 */
