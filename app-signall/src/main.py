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

PORT_NAME = '/dev/ttyUSB0'
url = "http://127.0.0.1:8000/store/endpoint/"

try:
    with serial.Serial(PORT_NAME, 9600) as ser:
        print(ser.name, ser.port)
        while True:
            try:
                command = int(input("Pick a command: \n(1)Read \n(2)Save to DB \n(3)Write to MC \n(4)Exit "))
                if command == 1:
                    bitcommand = 0x01


                    try:
                        # Read until newline character
                        data = ser.readline()
                        print(data)

                        # Decode bytes to string and strip whitespace/null characters
                        message = data.decode('ascii').rstrip('\n\0')

                        # Print the message
                        print(message)

                    except serial.SerialException as e:
                        print(f"Serial port error: {e}")

                elif command == 2:
                    values = []
                    print("Enter what you want to write (bin, power) enter an empty line to quit: ")
                    msg = input("> ")
                    while msg != "":
                        values.append([float(x.strip()) for x in msg.split(",") if x.strip()][:2])
                        msg = input("> ")
                    
                    data = {
                        "values": values,
                        "len" : len(msg),
                        "segn" : 45
                    }
                    response = requests.post(url, data=data)
                    print("Status code:", response.status_code)
                    print("Response body:", response.text)
                    
                elif command == 3:
                    try:
                        # Write data
                        ser.write(bytes([0x0A]))
                        ser.flush()
                        print(f"Sent data request")

                        # Small delay to allow response
                        time.sleep(0.1)

                        # Read response
                        if ser.in_waiting > 0:
                            data = ser.readline()
                            response = data.decode('ascii').rstrip('\n\0')
                            print(f"Received: {response}")

                    except serial.SerialException as e:
                        print(f"Serial port error: {e}")
                    finally:
                        ser.close()

                
                elif command == 4:
                    break

                else:
                    print("Invalid code, retry")
                    continue
            except KeyboardInterrupt:
                exit()
            except:
                print("Invalid code, retry")
                continue
            finally:
                ser.close()
except SerialException:
    print("UART not connected yet")


