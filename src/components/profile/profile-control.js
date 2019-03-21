import React from 'react';
import { withRouter } from 'react-router-dom';
import connect from 'react-redux';
import Button from '@material-ui/core/Button';

import Login from './Login/Login';
import SignUp from './SignUp/SignUp';
import Grid from '@material-ui/core/Grid';

class ProfileControl extends React.Component {
    constructor() {
      super();
      this.state = {
        loggedIn: localStorage.getItem("token") !== null
      };
      this.handleLogout = this.handleLogout.bind(this);
      this.handleLogin = this.handleLogin.bind(this);
      this.handleFavorites = this.handleFavorites.bind(this);
      this.handleComparison = this.handleComparison.bind(this);
    };

  handleFavorites(event) {
    this.props.history.push({
      pathname: '/favorites'
    });
  }

  handleComparison(event) {
    this.props.history.push({
      pathname: '/comparison'
    });
  }

  handleLogin = () => {
    if (localStorage.getItem("token") !== null) {
      this.setState({loggedIn: true})
      this.props.onLoginChange()
    }
  }

  handleLogout = (event) => {
    event.preventDefault();
    fetch('http://localhost:3000/api/profile/logout', {
      credentials: 'include',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          }
    })
    .then(response => {
      if (response.status === 201) {
        this.setState({loggedIn: false})
        localStorage.removeItem("token")
        console.log(localStorage.getItem("token"))
        this.props.onLoginChange()
      }
    })
    .catch(error => {
      console.log(error);
    });
  };

    render(){
          return (
                  <div style={{float: 'right', marginTop: '5px', marginRight: '15px'}}>
                  {this.state.loggedIn
                    ? (
                      <Grid container spacing={8}>
                        <Grid item>
                          <Button variant="contained" color="primary"
                            label="Submit"
                            onClick={this.handleLogout}
                            secondary={true}
                          >
                            Log out
                          </Button>
                        </Grid>
                      </Grid>)
                    : (
                      <Grid container spacing={8}>
                        <Grid item>
                          <Login action={this.handleLogin}/>
                        </Grid>
                        <Grid item>
                          <SignUp action={this.handleLogin}/>
                        </Grid>
                      </Grid>
                    )}
                  </div>
                )
        }
}

export default withRouter(ProfileControl);

