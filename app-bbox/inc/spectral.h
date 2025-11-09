#ifndef BBOX_CORE_SPECTRAL_H_
#define BBOX_CORE_SPECTRAL_H_

#include "types.h"


typedef enum spectral_state {
    SPEC_IDLE,
    SPEC_READY,
    SPEC_TRANSFORMED
} spectral_state_kind;


extern int8_t spectral_rfft(complex_t *dst, float32_t *src);


#endif  // BBOX_CORE_SPECTRAL_H_
