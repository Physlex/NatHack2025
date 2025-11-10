#include "panic.h"

#include <stdint.h>

#include "stm32wbxx_nucleo.h"


void panic() {
    static const uint32_t delayMs = 250;
    __disable_irq();
    while (1) {
        BSP_LED_Toggle(LED_BLUE);
        HAL_Delay(delayMs);

        BSP_LED_Toggle(LED_GREEN);
        HAL_Delay(delayMs);

        BSP_LED_Toggle(LED_RED);
        HAL_Delay(delayMs);
    }
}
