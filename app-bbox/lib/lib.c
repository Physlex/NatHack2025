#include <stdint.h>

#include "cmsis_gcc.h"
#include "stm32wb55xx.h"
#include "arm_math.h"


void fft_wrapper() {
  arm_cfft_f32(0, 0, 0, 0);
}

