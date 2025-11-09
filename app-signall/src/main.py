import serial
from serial import SerialException
import time
import struct
import sys

import serial.tools.list_ports
'''
ports = list(serial.tools.list_ports.comports())
for p in ports:

    print(f"{p.device}\t{p.description}\t{p.hwid}")
    '''

PORT_NAME = 'COM9'

try:
    with serial.Serial(PORT_NAME, 9600, timeout=1) as ser:
        print(ser.name, ser.port)
        command = int(input("Read(1) or Write(2): "))
        if command == 1:
            bitcommand = 0x01
            x = ser.read()          # read one byte
            print(x)
        if command == 2:
            bitcommand = 0x02
            msg = input("Enter what you want to write: ")
            ser.write(msg.encode('utf-8'))
except SerialException:
    print("UART not connected yet")
        
    
    #s = ser.read(10)        # read up to ten bytes (timeout)
    #line = ser.readline()