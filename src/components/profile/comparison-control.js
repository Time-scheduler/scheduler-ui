import React from 'react';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import axios from 'axios';

import querystring from 'query-string';
import HeaderView from '../result/header-view';
import ListView from '../result/list-view';

class ComparisonControl extends React.Component {
  constructor(props) {
    super(props);
    let search = querystring.parse(this.props.location.search);
    console.log(JSON.stringify(this.props))
    this.state = {
      query: search.query,
      results: [],
      selectedResult: null,
      errorMsg: ''
    };
    this.retrieveComparison = this.retrieveComparison.bind(this);
    this.onResultSelect = this.onResultSelect.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  };

  async onResultSelect(result) {
    await this.retrieveProduct(result);
    this.props.history.push({
      pathname: `/search/${this.props.match.params.category}/results/${result._id}`
    })
  }

  async componentDidMount(){
    await this.retrieveComparison();
  }

  retrieveComparison(category, query){
    fetch('http://localhost:3000/api/profile/comparison', {'headers': {'token': localStorage.getItem('token')}})
      .then(response => {
          return response.json()
      })
      .then(json => {
        if ('error' in json) {
          this.setState({errorMsg: json.error})
        } else {
          this.setState({results: json});
        }
      })
  }

  onSearchSubmit(query) {
    this.retrieveSearchResults(this.props.match.params.category, query);
    this.props.history.push({
      pathname: `/search/${this.props.match.params.category}`,
      search: '?query=' + encodeURI(query)
    });
  }

  render() {
    return (
      <div>
        <HeaderView
          searchQuery={this.state.search}
          onSearchBarFocus={this.onHeaderSearchBarFocus}
          onSearchSubmit={this.onSearchSubmit}
        />
        {this.state.errorMsg !== ''
          ? (<font color="red">{this.state.errorMsg}</font>) : (<p/>)}
        <ListView results={this.state.results} onResultSelect={this.onResultSelect} />
      </div>
    );
  }
}

export default withRouter(ComparisonControl);

