var Service;
var Characteristic;
var DoorState;
var crypto = require("crypto");
var fs = require('fs');

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
            this.log('Neither open or closed file exists');
            return true;
        } else {
            if (!fs.existsSync(this.openfilepath)) {
                this.log('There is no open file, so gate is closed');
                return true;
            }else {
                var statsOpen = fs.statSync(this.openfilepath);
                var statsClosed = fs.statSync(this.closedfilepath);
                this.log('closed file mod time is ' + statsClosed.mtime);
                this.log('open file mod time is ' + statsOpen.mtime);
                if (statsClosed.mtime <= statsOpen.mtime) {
                        this.log('Closed file is older than open file, door is open');
                        return true;
                } else {
                    this.log('Open file is newer than closed file, the gate is open');
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