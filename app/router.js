import Ember from 'ember';
import config from './config/environment';
import adminRouter from 'ember-admin/router';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  adminRouter(this);
});

export default Router;
