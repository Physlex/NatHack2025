#include "fram.h"
#include "ring.h"
#define FRAME_RING_CAP 256  // tune as needed

static ring_buffer_t fram_ring;
void fram_save(uint8_t *bytes, const uint32_t len) {
    //! @note Do ring buffering here.
    uint32_t written = 0;
    for (uint32_t i = 0; i < len; ++i) {
        int8_t rc = ring_write(&fram_ring, bytes[i]);
        if (rc != (int8_t)RB_SUCCESS) {
            // ring full; break or handle overflow policy here
            break;
        }
        ++written;
    }
}
