#ifndef BBOX_CORE_BLE_H_
#define BBOX_CORE_BLE_H_

#include "types.h"


#define NPERSEG 256
#define SEGN 10


typedef enum ble_error {
    BLE_SUCCESS=0,
    BLE_REQUIREMENTS,
    BLE_ACTIVE,
    BLE_OTHER
} ble_error_kind;


//! @note These represent the real-valued signals as input from BLE
typedef struct ble_buffers {
    float32_t *buffer0;
    float32_t *buffer1;
} ble_buffers_t;


typedef struct ble_pool {
    ble_buffers_t buffers;
    uint8_t active_buffer;
} ble_pool_t;


//! @note Initialize the memory addresses of the pool.
extern int8_t ble_init(ble_pool_t *self);

//! @note Swap the active buffer.
extern int8_t ble_swap_buffer(ble_pool_t *self);

//! @note Fill the active buffer with data. (USED IN TEST ONLY)
extern int8_t ble_fill_buffer(ble_pool_t *self, float32_t *data);

//! @note Grab a reference to the currently active buffer.
extern float32_t *ble_active_buffer(ble_pool_t *self);


#endif  // BBOX_CORE_BLE_H_
