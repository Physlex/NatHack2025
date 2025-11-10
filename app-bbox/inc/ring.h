#ifndef BBOX_CORE_RING_H_
#define BBOX_CORE_RING_H_

#include <stdint.h>


#define NPERSEG 256


typedef enum ring_buffer_error {
    RB_SUCCESS,
    RB_REQUIREMENTS,
    RB_OVERRUN,
    RB_UNDERRUN
} ring_buffer_error_kind;


typedef struct ring_buffer {
    //! @note Put the required variables here 
    uint8_t *data;
    uint32_t size;
    uint32_t read_ptr;
    uint32_t write_ptr;
} ring_buffer_t;


//! @note Initialize the ring buffer.
extern int8_t ring_init(ring_buffer_t *self, uint8_t *im_addr, const uint32_t size);

//! @note Increment write pointer, save a byte to the ring.
extern int8_t ring_write(ring_buffer_t *self, uint8_t byte);

//! @note Increment read pointer, read a byte from the ring.
extern uint8_t ring_read(ring_buffer_t *self);


#endif  // BBOX_CORE_RING_H
