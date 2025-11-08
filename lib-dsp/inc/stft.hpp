#ifndef DSP_CORE_STFT_HPP_
#define DSP_CORE_STFT_HPP_

#include "bb_types.hpp"


extern void stft(
    float32_t *data, float32_t *spectrogram, const uint32_t segn, const uint32_t nperseg
);


#endif  // DSP_CORE_STFT_HPP_
