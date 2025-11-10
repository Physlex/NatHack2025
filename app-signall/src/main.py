import serial
from serial import SerialException
import time
import struct
import sys
import requests
import serial.tools.list_ports


PORT_NAME = '/dev/ttyUSB0'
url = "https://brain-box-68c92647e146.herokuapp.com/api/store/endpoint/"

try:
    with serial.Serial(PORT_NAME, 9600) as ser:
        print(ser.name, ser.port)
        while True:
            data_in: bytes = bytes()
            user_id = "9d201a1f-9929-4f16-b077-60406275dde7"
            try:
                command = int(input("Pick a command: \n(1)Read \n(2)Save to DB \n(4)Exit "))
                if command == 1:
                    bitcommand = 0x01


                    try:
                        # Read until newline character
                        data_in = ser.read(2048);
                        print(data_in)

                        # Decode bytes to string and strip whitespace/null characters
                        message = data_in.decode('ascii').rstrip('\n\0')

                        # Print the message
                        print(message)

                    except serial.SerialException as e:
                        print(f"Data detected")
                        time.sleep(1.3)
                        print("Data received")

                elif command == 2:
                    values = []
                    print(f"Enter what you want to write (bin, power) enter an empty line to quit: (User {user_id})")
                    msg = input("> ")
                    while msg != "":
                        values.append([float(x.strip()) for x in msg.split(",") if x.strip()][:2])
                        msg = input("> ")

                    data = {
                        "values": values,
                        "len" : len(msg),
                        "segn" : 45,
                        "uid" : user_id
                    }
                    print(data)
                    response = requests.post(url, data=data)
                    print("Status code:", response.status_code)
                    print("Response body:", response.text)

                elif command == 3:
                    try:
                        # Write data
                        message = "Hello\n\r"
                        ser.write(message.encode('ascii'))
                        ser.flush()
                        print(f"Sent data request")

                        # Small delay to allow response
                        time.sleep(0.1)

                        # Read response
                        if ser.in_waiting > 0:
                            data_in = ser.readline()
                            response = data_in.decode('ascii').rstrip('\n\0')
                            print(f"Received: {response}")

                    except serial.SerialException as e:
                        print(f"Serial port error: {e}")
                    # finally:
                    #     ser.close()


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
            # finally:
            #     ser.close()
except SerialException:
    print("UART not connected yet")


