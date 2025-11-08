/** @file `main.cpp`
 *  @brief This file defines the entry point to the brain box application.
 */

#include <stdint.h>


int32_t main() {
    while (1) {
        __asm__ volatile ("nop");
    }
}
