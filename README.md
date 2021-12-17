# homebridge-filebased-contactsensor
A filebased contact sensor for Homebridge

This plugin sensor monitors the modification time of an "open file" and a "closed file" to determine the state of a door.

For background, this is my way of kluding together integration of a yolink door sensors into homekit.

My particular setup relies on several interconnected components:

1.  Yolink Door sensors https://shop.yosmart.com/collections/featured/products/outdoor-contact-sensor
2.  IFTTT recipes that connects with yolink.  I append to an open or closed file hosted on dropbox  when receiving the corresponding event from yolink.  
3.  Synology Cloudsync synchronizing my dropbox account
4.  Homebridge running as a docker container on a Synology NAS.  I present the synchronized dropbox folder to the docker container
5.  Finally this plugin


Configure the plugin as follows:


      {
            "name": "Patio Gate",
            "openpath": "/yolink/devices/patiogate/open.txt",
            "closedpath": "/yolink/devices/patiogate/closed.txt",
            "accessory": "DoorSensor"
        }
        
The logic works as follows:

  * If neither the openpath or closedpath file exist, then the door is closed
  * If only the open file exists, then the door is open
  * If only the closed file exists, then the door is closed
  * If both files exist, then compare the last modification time.  The most recently modified file reflects the current state of the door.

I poll the status of the files every 1/2 second.

--

Lots of improvements to make, especially around building the config properly.  

Enjoy. 


