#include "spectral.h"

#include <arm_math.h>


#define NPERSEG 256


static uint32_t saved = 0;
static complex_t buffer[NPERSEG];
static int8_t curr_state = SPEC_IDLE;


int8_t spectral_rfft(complex_t *dst, float32_t *src) {
    if (saved == 0) {
        for (uint32_t i = 0; i < NPERSEG; ++i) {
            buffer[i].real = src[i];
        }
    } else if (saved == 1) {
        for (uint32_t i = 0; i < NPERSEG; ++i) {
            buffer[i].imag = src[i];
        }

        curr_state = SPEC_READY;
        saved = 0;
    }

    if (curr_state == SPEC_READY) {
        arm_rfft_instance_f32 S;
        arm_cfft_radix4_instance_f32 S_CFFT;

        int8_t arm_res = arm_rfft_init_f32(&S, &S_CFFT, NPERSEG, 0, 1);
        if (arm_res != ARM_MATH_SUCCESS) {
            return -arm_res;
        }

        //! @note In-place real fft of two signals into one power buffer.
        arm_rfft_f32((arm_rfft_instance_f32 *)&S, (float32_t *)buffer, (float32_t *)dst);

        curr_state = SPEC_IDLE;
    }

    return SPEC_TRANSFORMED;
}
