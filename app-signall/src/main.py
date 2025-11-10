import serial
from serial import SerialException
import time
import struct
import sys
import requests
import serial.tools.list_ports
'''
ports = list(serial.tools.list_ports.comports())
for p in ports:

    print(f"{p.device}\t{p.description}\t{p.hwid}")
    '''

PORT_NAME = 'COM9'
url = "http://127.0.0.1:8000/store/endpoint/"

try:
    with serial.Serial(PORT_NAME, 9600) as ser:
        print(ser.name, ser.port)
        while True:
            try:
                command = int(input("Pick a command: \n(1)Read \n(2)Write \n(3)Exit "))
                if command == 1:
                    bitcommand = 0x01
                                
                    print("imagine we read something")
                elif command == 2:
                    bitcommand = 0x02
                    msg = input("Enter what you want to write: ")
                    data = {
                        "msg": msg,
                        "code": "2",
                        "time" : "time"
                    }
                    response = requests.post(url, data=data)
                    print("Status code:", response.status_code)
                    print("Response body:", response.text)
                elif command == 3:
                    break
                
                else:
                    print("Invalid code, retry")
                    continue
            except:
                print("Invalid code, retry")
                continue
except SerialException:
    print("UART not connected yet")
        
    
