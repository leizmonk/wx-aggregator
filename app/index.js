import { Component, h, render } from 'preact';
import Router from 'preact-router';
import AWS from 'aws-sdk';

import Header from './components/header/header';
import Home from './views/home/home';

if (typeof document !== "undefined") {
  const Main = () => (
    <div class="app">
      <Header title="WX Aggregator" />
      <Router>
        <Home path="/" />
        <Error type="404" default />
      </Router>
    </div>
  );

  render(<Main />, document.body);
}