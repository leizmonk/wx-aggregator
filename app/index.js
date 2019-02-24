import { Component, h, render } from 'preact';
import Router from 'preact-router';

import Header from './components/header/header';
import Home from './views/home/home';

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