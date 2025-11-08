#include "ble.h"


static float32_t ble_double_buffer[(NPERSEG << 1)];


int8_t ble_init(ble_pool_t *self) {
    if (!self) {
        return -REQUIREMENTS;
    }

    self->buffers.buffer0 = ble_double_buffer;
    self->buffers.buffer1 = ble_double_buffer + NPERSEG;

    return SUCCESS;
}


int8_t ble_swap_buffer(ble_pool_t *self) {
    if (!self) {
        return -REQUIREMENTS;
    }

    self->active_buffer = (self->active_buffer + 1) % 2;

    return SUCCESS;
}


int8_t ble_fill_buffer(ble_pool_t *self) {
    if (!self) {
        return -REQUIREMENTS;
    }

    //! @note Fill the active buffer.

    float32_t *active = ble_active_buffer(self);

    for (uint32_t i = 0; i < NPERSEG; ++i) {
        active[i] = 1.f;
    }

    //! @note Swap to the next empty buffer.
    ble_swap_buffer(self);
}


float32_t *ble_active_buffer(ble_pool_t *self) {
    if (!self) {
        return 0;
    }

    float32_t *active = &self->buffers.buffer0[self->active_buffer * NPERSEG];
    return active;
}
