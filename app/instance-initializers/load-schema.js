
export function initialize( app ) {
  let myService = app.lookup('service:model-generator');
  myService.loadSchema().then(function(schema){
    myService.setSchema(schema);

  });

}

export default {
  name: 'load-schema',
  initialize
};
