import React, { Component } from "react";
import { Route, Switch, withRouter } from "react-router-dom";

import { predict } from "./tools/predict";
import { getTweets } from "./tools/API";
import * as tf from "@tensorflow/tfjs";

import SentiHeader from "./components/SentiHeader/SentiHeader";
import SentiMap from "./components/SentiMap/SentiMap";
// import SentiForm from './components/SentiForm/SentiForm';
import SentiStats from "./components/SentiStats/SentiStats";
import SentiFooter from "./components/SentiFooter/SentiFooter";

import { Hero, Container } from "react-bulma-components";
import SentiList from "./components/SentiList/SentiList";
import Loader from "react-loader-spinner";
class App extends Component {
  state = {
    location: {
      lat: 51.505,
      lng: -0.09
    },
    radius: 10,
    topic: "",
    count: 100,
    tweets: [],
    emotions: ["disgust", "sadness", "shame", "joy", "guilt", "fear", "anger"],
    predictions: [],
    hasModelBeenLoaded: false,
    loading: true,
    active: false,
    fetchedTweets: false
  };

  // Load model from API
  async componentDidMount() {
    this.model = await tf.loadLayersModel(
      "https://sentimap-nodejs-api.herokuapp.com/model.json"
    );
    this.setState({ loading: false, hasModelBeenLoaded: true });
  }

  // set location
  onGetLocation = childData => {
    this.setState({
      location: childData
    });
  };

  // update state on form change
  onFormChange = childData => {
    this.setState({
      ...childData
    });
  };

  // update state on get form & fetch tweets
  onGetForm = childData => {
    const { topic, radius } = childData;
    this.setState(
      {
        topic: topic,
        radius: radius,
        loading: true
      },
      () => this.fetchTweets()
    );
  };

  // fetch the tweets given the query settings from the state
  fetchTweets = () => {
    const data = {
      topic: this.state.topic,
      radius: this.state.radius,
      count: this.state.count,
      latitude: this.state.location.lat,
      longitude: this.state.location.lng
    };

    getTweets(data)
      .then(res => {
        if (res.status === 200) {
          res.json().then(res => {
            this.setState({
              loading: false,
              fetchedTweets: true
            });
            this.predictTweets(res);
            this.props.history.push("/tweets");
          });
        } else {
          this.setState({ noTopic: true });
        }
      })
      .catch(err => console.log(err));
  };

  async predictTweets(tweets) {
    console.log(tweets.length);
    const classifiedTweets = await predict(tweets, this.model);
    this.setState({
      noTopic: false,
      predictions: classifiedTweets
    });
  }

  onToggle = () => {
    this.setState({
      active: !this.state.active
    });
  };

  render() {
    const { loading, hasModelBeenLoaded } = this.state;

    return (
      <>
        <Hero size="fullheight">
          <Hero.Head>
            <Container>
              <SentiHeader
                active={this.state.active}
                open={this.onToggle}
                topic={this.state.topic}
                emotions={this.state.emotions}
                onFormChange={this.onFormChange}
                onFormSubmitted={this.onGetForm}
                predictions={this.state.predictions}
                loading={this.state.loading}
              />
            </Container>
          </Hero.Head>

          <Hero.Body>
            {loading ? (
              <div
                style={{
                  width: "100%",
                  height: "100",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center"
                }}
              >
                {hasModelBeenLoaded ? null : (
                  <h1>
                    Loading the TensorFlow model (~40mb). <br /> Please wait
                    until it is loaded.
                  </h1>
                )}
                <Loader type="ThreeDots" color="#2BAD60" />
              </div>
            ) : (
              <Switch>
                <Route
                  exact
                  path="/"
                  render={props => (
                    <SentiMap
                      radius={this.state.radius}
                      circleLocation={this.onGetLocation}
                    />
                  )}
                />
                <Route
                  path="/tweets"
                  render={() => <SentiList tweets={this.state.predictions} />}
                />
                <Route
                  path="/stats"
                  render={() => (
                    <SentiStats
                      labels={this.state.emotions}
                      tweets={this.state.predictions}
                    />
                  )}
                />
              </Switch>
            )}
          </Hero.Body>
          <Hero.Footer>
            <SentiFooter />
          </Hero.Footer>
        </Hero>
      </>
    );
  }
}

export default withRouter(App);
