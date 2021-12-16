var Service;
var Characteristic;
var DoorState;
var crypto = require("crypto");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    DoorState = homebridge.hap.Characteristic.CurrentDoorState;
    homebridge.registerAccessory("homebridge-filebased-contactsensor", "DoorSensor", DoorSensorAccessory);

};
//constructor function

function DoorSensorAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.openfilepath = config["openpath"];
  this.closedfilepath = config["closedpath"];

  if(config["sn"]){
      this.sn = config["sn"];
  } else {
      var shasum = crypto.createHash('sha1');
      shasum.update(this.openfilepath);
      this.sn = shasum.digest('base64');
      this.log('Computed SN ' + this.sn);
      this.log('Open File ' + this.openfilepath );
      this.log('Close File ' + this.closedfilepath);
  }

  this.isClosed = true;
  this.service = new Service.ContactSensor(this.name);

}

DoorSensorAccessory.prototype = {

    identify: function(callback) {
        this.log("Identify requested");
        callback(null);
    },

    monitorDoorState: function() {
        this.isClosed = this.isDoorClosed();
        this.service.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isClosed);
    },

    isDoorClosed: function() {
        this.log("closed file path", this.closedfilepath);
        if (!fs.existsSync(this.closedfilepath) && !fs.existsSync(this.openfilepath)) {
            return true;
        } else {
            if (!fs.existsSync(this.openfilepath)) {
                return true;
            }else {
                var statsOpen = fs.statSync(this.openfilepath);
                var statsClosed = fs.statSync(this.closedfilepath);

                if (statsClosed.mtime >= statsOpen.mtime) {
                        return true;
                } else {
                    return false;
                }
            }
        }
    },

    getContactSensorState: function(callback) {
        this.isClosed = this.isDoorClosed();
        this.log("getConactSensorState: ", this.isClosed);
        callback(null,this.isClosed);
    },

    getName: function(callback) {
        this.log("getName :", this.name);
        callback(null, this.name);
    },

    getServices: function() {
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, "Homebridge")
      .setCharacteristic(Characteristic.Model, "Contact Sensor")
      .setCharacteristic(Characteristic.SerialNumber, this.sn);

      this.service
            .getCharacteristic(Characteristic.ContactSensorState)
            .on('get', this.getContactSensorState.bind(this));

        this.service
            .getCharacteristic(Characteristic.Name)
            .on('get', this.getName.bind(this));

        return [informationService, this.service];
  }
};