#ifndef DSP_CORE_WELCH_HPP_
#define DSP_CORE_WELCH_HPP_

#include "bb_types.hpp"
#include "stft.hpp"


extern void welch(
    float32_t *data,
    float32_t *periodogram,
    const uint32_t segn,
    const uint32_t nperseg
);


#endif  // DSP_CORE_WELCH_HPP_
