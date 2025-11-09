#include "bbox_ble.h"


static float32_t ble_double_buffer[(NPERSEG << 1)];


int8_t ble_init(ble_pool_t *self) {
    if (!self) {
        return -BLE_REQUIREMENTS;
    }

    self->buffers.buffer0 = ble_double_buffer;
    self->buffers.buffer1 = ble_double_buffer + NPERSEG;

    return BLE_SUCCESS;
}


int8_t ble_discover_ganglion() {

}


int8_t ble_swap_buffer(ble_pool_t *self) {
    if (!self) {
        return -BLE_REQUIREMENTS;
    }

    self->active_buffer = (self->active_buffer + 1) % 2;

    return BLE_SUCCESS;
}


int8_t ble_fill_buffer(ble_pool_t *self, float32_t *data) {
    if (!self) {
        return -BLE_REQUIREMENTS;
    }

    //! @note Fill the active buffer.

    data = ble_active_buffer(self);
    if (!data) {
        return -BLE_ACTIVE;
    }

    for (uint32_t i = 0; i < NPERSEG; ++i) {
        data[i] = 1.f;
    }

    //! @note Swap to the next empty buffer.

    if (ble_swap_buffer(self) < 0) {
        return -BLE_OTHER;
    }

    return BLE_SUCCESS;
}


float32_t *ble_active_buffer(ble_pool_t *self) {
    if (!self) {
        return 0;
    }

    float32_t *active = &self->buffers.buffer0[self->active_buffer * NPERSEG];
    return active;
}
