import React from 'react';
//import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
//import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';
//import Checkbox from '@material-ui/core/Checkbox';

import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
    main: {
          width: 'auto',
          display: 'block', // Fix IE 11 issue.
          marginLeft: theme.spacing.unit * 3,
          marginRight: theme.spacing.unit * 3,
          [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
                  width: 400,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                },
        },
    paper: {
          marginTop: theme.spacing.unit * 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
        },
    avatar: {
          margin: theme.spacing.unit,
          backgroundColor: theme.palette.secondary.main,
        },
    form: {
          width: '100%', // Fix IE 11 issue.
          marginTop: theme.spacing.unit,
        },
    submit: {
          marginTop: theme.spacing.unit * 3,
        },
});

class SignUp extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        email: '',
        username: '',
        password: '',
        passwordConf: '',
        open: false,
        checked: false,
        errorMsg: ''
      };
      this.handleSignUp = this.handleSignUp.bind(this);
    };

    onChange = (e) => {
      this.setState({ [e.target.name]: e.target.value });
    };

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    event.preventDefault();
    this.setState({open: false});
  };

  handleSignUp = (event) => {
    event.preventDefault();
    const data = new FormData(event.target.parentNode);
    console.log(JSON.stringify(data));
    console.log(JSON.stringify(this.state.email));
    console.log(JSON.stringify(this.state.username));
    console.log(JSON.stringify(this.state.password));
    console.log(JSON.stringify(this.state.passwordConf));

    fetch('http://time-tracker.eastus.cloudapp.azure.com:3000/api/profile/login', {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          },

      body: JSON.stringify({
        'email': this.state.email,
        'username': this.state.username,
        'password': this.state.password,
        'passwordConf': this.state.passwordConf
      }),
      mode: 'cors'
    })
    .then(response => {
        return response.json()
    })
    .then(resJson => {
      if ('token' in resJson) {
        console.log("Res: "+ JSON.stringify(resJson))
        localStorage.setItem('token', resJson.token)
        this.setState({open: false})
        this.props.action()
      } else if ('error' in resJson) {
        this.setState({errorMsg: resJson.error})
      } else {
        this.setState({errorMsg: 'Unknown error. Please contact developers.'})
      }
    })
    .catch(error => {
      console.log(error);
    });
  };

  updateCheck() {
    this.setState((oldState) => {
      return {
        checked: !oldState.checked,
      };
    });
  }

  render(){
    const actions = [
      <Button variant="contained" color="primary"
        label="Submit"
        onClick={this.handleClose}
        secondary={true}
        style={styles.buttonStyle}
      />,
    ];
    const { classes } = this.props;

    return (
      <div>
        <Button variant="contained" color="primary"
          label="SignUp" 
          onClick={this.handleOpen} 
          secondary={true}
          style={styles.buttonStyle} 
        >
         SignUp
        </Button>
        <Dialog
          title="Sign Up"
          actions={actions}
          open={this.state.open}
          onBackdropClick={this.handleClose}
        >
           <Paper className={classes.paper}>
              <Avatar className={classes.avatar}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                 Sign up 
              </Typography>
              <form className={classes.form}>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="email">Email Address</InputLabel>
                  <Input id="email" name="email" autoComplete="email" autoFocus onChange={this.onChange} />
                </FormControl>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="username">Username</InputLabel>
                  <Input id="username" name="username" autoComplete="username" autoFocus onChange={this.onChange} />
                </FormControl>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <Input name="password" type="password" id="password" onChange={this.onChange}/>
                </FormControl>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <Input name="passwordConf" type="password" id="passwordConf" onChange={this.onChange}/>
                </FormControl>
                  {this.state.errorMsg !== ''
                    ? (<font color="red">{this.state.errorMsg}</font>) : (<p/>)}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                    onClick={this.handleSignUp}
                >
                  Sign up
                </Button>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    className={classes.submit}
                    onClick={this.handleClose}
                >
                  Cancel
                </Button>
              </form>
            </Paper>
        </Dialog>
      </div>
    )
  }
}
export default withStyles(styles)(SignUp);

