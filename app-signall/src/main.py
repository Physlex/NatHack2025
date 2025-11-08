import serial
import time

import serial.tools.list_ports
'''
ports = list(serial.tools.list_ports.comports())
for p in ports:

    print(f"{p.device}\t{p.description}\t{p.hwid}")
    '''
    
with serial.Serial('COM9', 9600, timeout=1) as ser:
    print(ser.name)
    command = int(input("Read(1) or Write(2): "))
    if command == 1:
        x = ser.read()          # read one byte
        print(x)
    if command == 2:
        msg = input("Enter what you want to write: ")
        ser.write(msg.encode('utf-8'))
        
    #s = ser.read(10)        # read up to ten bytes (timeout)
    #line = ser.readline()