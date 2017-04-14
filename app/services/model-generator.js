import Ember from 'ember';
import DS from 'ember-data';

const { inject: { service } } = Ember;

export default Ember.Service.extend({
  namespace: 'df',
  store: service(),
  schema: {},

  setSchema(jsonString) {
    let vm = this;
    let store = this.get('store');
    let schema = JSON.parse(jsonString);
    this.set('schema', schema);
    for (let table in schema) {
      if (schema.hasOwnProperty(table) && table.toLocaleLowerCase() !== 'user') {
        let propertiesList = schema[table]['Schema'];
        let primaryKey = schema[table]['Primary_Key'];
        let inverseRelationship = schema[table]['Inverse'];
        let tableColumns = {};
        if (inverseRelationship) {
          for (var i = 0; i < inverseRelationship.length; i++) {
            var element = inverseRelationship[i];
            var keys = Object.keys(element);
            var inverse = element[keys[0]];
            var inverseSplit = inverse.split("_");
            var inflector = new Ember.Inflector(Ember.Inflector.defaultRules);

            if (inverseSplit.length > 1) {
              tableColumns[Ember.String.dasherize(inflector.pluralize(inverse))] = DS.hasMany(Ember.String.dasherize(keys[0]), { inverse: inverse });
            } else {

              tableColumns[Ember.String.dasherize(inflector.pluralize(keys[0]))] = DS.hasMany(Ember.String.dasherize(keys[0]));
            }
          }
        }

        for (var property in propertiesList) {
          if (propertiesList.hasOwnProperty(property)) {
            var type = propertiesList[property].Type;
            var EmberRecognisedType = vm.getEmberRecognisedType(type);
            if (property === primaryKey) {
              tableColumns['Primary_Key'] = DS.attr(EmberRecognisedType);
            }
            else {
              var foreginKey = propertiesList[property]['Foreign_Key'];
              if (foreginKey) {
                tableColumns[property] = DS.belongsTo(foreginKey, { async: true });
              }
              else {
                tableColumns[property] = DS.attr(EmberRecognisedType);
              }
            }
          }
        }
        Ember.getOwner(store).register('model:' + Ember.String.dasherize(table), DS.Model.extend(tableColumns));
        console.log(Ember.String.dasherize(table),tableColumns );
        let adminService = Ember.getOwner(this).lookup('store:admin');
        // Ember.getOwner(adminService).register('model:' + Ember.String.dasherize(table), DS.Model.extend(tableColumns));
        Ember.getOwner(this).register('store:admin', adminService);
      }
    }
  },
  getEmberRecognisedType(type) {
    switch (type) {
      case 'ENUM':
        return 'string';
      case 'STRING':
        return 'string';
      case 'BOOLEAN':
        return 'boolean';
      case 'DAI_TIME':
        return 'dai-date';
      case 'DAI_DAY':
        return 'dai-date';
      case 'INT':
        return 'number';
      case 'LONG_LONG':
        return 'number';
      case 'UINT':
        return 'number';
      case 'REAL':
        return 'number';
      case 'STRING_REF':
        return 'string';
      case 'LOCATION':
        return 'string';
      case 'SUB_STRUCT':
        return 'string';
      default:
        console.log(type);
        return type;
    }
  },
  loadSchema() {
    var url = 'http://nodejs-zardaloop.rhcloud.com/api';
    return new Ember.RSVP.Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.send();
      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject();
          }
        }
      }
    });
  }
});

