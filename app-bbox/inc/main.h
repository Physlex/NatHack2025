#ifndef __MAIN_H
#define __MAIN_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32wbxx_hal.h"
#include "stm32wbxx_nucleo.h"

#include <stdio.h>

static volatile uint32_t APP_State = 0x00000000;

extern void Error_Handler(void);


#define SYS_WKUP2_Pin GPIO_PIN_13
#define SYS_WKUP2_GPIO_Port GPIOC
#define RCC_OSC32_IN_Pin GPIO_PIN_14
#define RCC_OSC32_IN_GPIO_Port GPIOC
#define RCC_OSC32_OUT_Pin GPIO_PIN_15
#define RCC_OSC32_OUT_GPIO_Port GPIOC
#define USB_DM_Pin GPIO_PIN_11
#define USB_DM_GPIO_Port GPIOA
#define USB_DP_Pin GPIO_PIN_12
#define USB_DP_GPIO_Port GPIOA
#define JTMS_Pin GPIO_PIN_13
#define JTMS_GPIO_Port GPIOA
#define JTCK_Pin GPIO_PIN_14
#define JTCK_GPIO_Port GPIOA
#define JTDO_Pin GPIO_PIN_3
#define JTDO_GPIO_Port GPIOB

#define APP_FLAG_CPU2_INITIALIZED          0
#define APP_FLAG_WIRELESS_FW_RUNNING       1
#define APP_FLAG_FUS_FW_RUNNING            2
#define APP_FLAG_BLE_INITIALIZED           3
#define APP_FLAG_BLE_ADVERTISING           4
#define APP_FLAG_BLE_CONNECTED             5
#define APP_UNKNOWN_6                      6
#define APP_UNKNOWN_7                      7
#define APP_UNKNOWN_8                      8
#define APP_UNKNOWN_9                      9
#define APP_UNKNOWN_10                     10
#define APP_UNKNOWN_11                     11
#define APP_UNKNOWN_12                     12
#define APP_UNKNOWN_13                     13
#define APP_UNKNOWN_14                     14
#define APP_UNKNOWN_15                     15
#define APP_UNKNOWN_16                     16
#define APP_UNKNOWN_17                     17
#define APP_FLAG_HCI_EVENT_PENDING         18
#define APP_FLAG_SHCI_EVENT_PENDING        19
#define APP_FLAG_CPU2_ERROR                24
#define APP_FLAG_BLE_INITIALIZATION_ERROR  25
#define APP_FLAG_GET(flag)      VariableBit_Get_BB(((uint32_t)&APP_State), flag)
#define APP_FLAG_SET(flag)      VariableBit_Set_BB(((uint32_t)&APP_State), flag)
#define APP_FLAG_RESET(flag)    VariableBit_Reset_BB(((uint32_t)&APP_State), flag)



#ifdef __cplusplus
}
#endif

#endif /* __MAIN_H */
