# STM32WB55RG UART Interrupt Implementation Guide

## Overview
This guide demonstrates how to implement UART interrupt-based reception on the STM32WB55RG microcontroller using the HAL driver. The implementation is based on the existing driver files in `app-bbox/Drivers/STM32WBxx_HAL_Driver/`.

## Architecture Understanding

### Key Components from HAL Driver Analysis

**From `stm32wbxx_hal_uart.h:1640-1666`:**
- `HAL_UART_Receive_IT()` - Initiates interrupt-based reception
- `HAL_UART_IRQHandler()` - Core interrupt handler (must be called from ISR)
- `HAL_UART_RxCpltCallback()` - User callback invoked when reception completes

**From `stm32wb55xx.h:117`:**
- `USART1_IRQn = 36` - NVIC interrupt number for USART1

**From `stm32wbxx_hal_uart.h:780-782`:**
- `UART_IT_RXNE` (0x0525) - RX Not Empty interrupt flag
- `UART_IT_IDLE` (0x0424) - Idle line detection interrupt flag

## Implementation

### 1. UART MSP Initialization (Hardware Layer)
Add this to `src/stm32wbxx_hal_msp.c`:

```c
/**
  * @brief UART MSP Initialization
  * This function configures the hardware resources used for UART:
  * - Enables peripheral clocks (USART1 and GPIO)
  * - Configures GPIO pins for UART TX/RX alternate functions
  * - Enables and configures NVIC for USART1 interrupts
  *
  * @param huart: UART handle pointer
  * @retval None
  */
void HAL_UART_MspInit(UART_HandleTypeDef* huart)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};

  if(huart->Instance == USART1)
  {
    /* Peripheral clock enable */
    __HAL_RCC_USART1_CLK_ENABLE();
    __HAL_RCC_GPIOB_CLK_ENABLE();

    /**
     * USART1 GPIO Configuration (typical for STM32WB55RG)
     * PB6 ------> USART1_TX
     * PB7 ------> USART1_RX
     *
     * Note: Verify your hardware schematic for actual pin mapping
     */
    GPIO_InitStruct.Pin = GPIO_PIN_6 | GPIO_PIN_7;
    GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;           // Alternate function push-pull
    GPIO_InitStruct.Pull = GPIO_NOPULL;               // No pull-up or pull-down
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;      // Low speed sufficient for 9600 baud
    GPIO_InitStruct.Alternate = GPIO_AF7_USART1;      // AF7 is USART1 for these pins
    HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);

    /*
     * USART1 interrupt configuration
     * Priority: 5 (lower number = higher priority, range 0-15)
     * SubPriority: 0 (used when priorities are equal)
     */
    HAL_NVIC_SetPriority(USART1_IRQn, 5, 0);
    HAL_NVIC_EnableIRQ(USART1_IRQn);
  }
}

/**
  * @brief UART MSP De-Initialization
  * This function frees hardware resources used by the UART instance
  *
  * @param huart: UART handle pointer
  * @retval None
  */
void HAL_UART_MspDeInit(UART_HandleTypeDef* huart)
{
  if(huart->Instance == USART1)
  {
    /* Peripheral clock disable */
    __HAL_RCC_USART1_CLK_DISABLE();

    /* GPIO pins deconfiguration */
    HAL_GPIO_DeInit(GPIOB, GPIO_PIN_6 | GPIO_PIN_7);

    /* USART1 interrupt disable */
    HAL_NVIC_DisableIRQ(USART1_IRQn);
  }
}
```

**Why this works:**
- `__HAL_RCC_USART1_CLK_ENABLE()` powers the USART1 peripheral
- GPIO pins must be configured as alternate function (AF7) to route UART signals
- NVIC configuration enables the processor to respond to USART1 interrupts
- Priority 5 allows higher-priority interrupts (0-4) to preempt UART processing

### 2. Interrupt Service Routine (ISR)
Add this to `src/stm32wbxx_it.c` in the "STM32WBxx Peripheral Interrupt Handlers" section (after line 199):

```c
/**
  * @brief This function handles USART1 global interrupt.
  *
  * The USART1 hardware triggers this interrupt for various events:
  * - RXNE (Receive Not Empty): Data arrived in RDR register
  * - TXE (Transmit Empty): Transmit buffer ready for new data
  * - TC (Transmission Complete): All data transmitted
  * - IDLE: Idle line detected (useful for variable-length messages)
  * - Errors: Overrun, framing, parity, noise errors
  *
  * HAL_UART_IRQHandler() examines enabled interrupt flags and calls
  * appropriate internal handlers and user callbacks
  */
void USART1_IRQHandler(void)
{
  /* USER CODE BEGIN USART1_IRQn 0 */

  /* USER CODE END USART1_IRQn 0 */

  /*
   * HAL_UART_IRQHandler() performs:
   * 1. Reads interrupt status register (ISR)
   * 2. Checks which interrupt flags are set AND enabled
   * 3. Handles data transfer (read/write from/to data register)
   * 4. Manages internal state machine
   * 5. Calls user callbacks (e.g., HAL_UART_RxCpltCallback)
   */
  HAL_UART_IRQHandler(&huart1);

  /* USER CODE BEGIN USART1_IRQn 1 */

  /* USER CODE END USART1_IRQn 1 */
}
```

**Note:** Add `extern UART_HandleTypeDef huart1;` at the top of `stm32wbxx_it.c` in the "External variables" section (around line 57).

**Why this works:**
- When USART1 hardware detects an enabled event (e.g., byte received), it signals the NVIC
- NVIC jumps to `USART1_IRQHandler()`
- `HAL_UART_IRQHandler()` (from `stm32wbxx_hal_uart.c`) decodes the event and manages reception
- After reading the expected number of bytes, it calls `HAL_UART_RxCpltCallback()`

### 3. User Application Code
Add this to your `src/main.c`:

```c
/* USER CODE BEGIN PV */
/* Private variables */

/*
 * Reception buffer: stores incoming UART data
 * Size: 10 bytes (adjust based on your protocol)
 */
uint8_t rxBuffer[10];

/* Flag indicating new data arrived (set by callback, cleared by main loop) */
volatile uint8_t dataReceivedFlag = 0;

/* USER CODE END PV */

/**
  * @brief UART Receive Complete Callback
  *
  * This callback is invoked by HAL_UART_IRQHandler() when:
  * - The exact number of bytes requested in HAL_UART_Receive_IT() have been received
  * - Reception completed successfully (no errors)
  *
  * Execution context: Interrupt context (keep it SHORT and FAST)
  *
  * @param huart: UART handle that completed reception
  * @retval None
  */
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
  if(huart->Instance == USART1)
  {
    /* Set flag for main loop to process data */
    dataReceivedFlag = 1;

    /*
     * CRITICAL: Re-enable reception for next message
     * Without this, you'll only receive ONE message total!
     *
     * This call reconfigures the HAL state machine to expect
     * another 10 bytes and re-enables RXNE interrupt
     */
    HAL_UART_Receive_IT(&huart1, rxBuffer, sizeof(rxBuffer));
  }
}

/**
  * @brief Alternative: UART Idle Line Callback
  *
  * This callback triggers when the RX line has been idle (no transitions)
  * for one frame duration. Useful for variable-length messages.
  *
  * To use this, you need:
  * 1. Enable IDLE interrupt: __HAL_UART_ENABLE_IT(&huart1, UART_IT_IDLE);
  * 2. Optionally use HAL_UARTEx_ReceiveToIdle_IT() instead of HAL_UART_Receive_IT()
  *
  * @param huart: UART handle
  * @param Size: Number of bytes received
  * @retval None
  */
void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
{
  if(huart->Instance == USART1)
  {
    /* Process Size bytes from rxBuffer */
    dataReceivedFlag = 1;

    /* Re-enable for next message */
    HAL_UARTEx_ReceiveToIdle_IT(&huart1, rxBuffer, sizeof(rxBuffer));
  }
}

/* In main() function, after MX_USART1_UART_Init(): */

int main(void)
{
  /* ... existing initialization code ... */

  MX_USART1_UART_Init();

  /* USER CODE BEGIN 2 */

  /*
   * Start interrupt-based reception
   *
   * Parameters:
   * - &huart1: Handle initialized by MX_USART1_UART_Init()
   * - rxBuffer: Destination for received data
   * - sizeof(rxBuffer): Number of bytes to receive (10)
   *
   * This function:
   * 1. Configures internal HAL state (sets RxState to BUSY)
   * 2. Stores buffer pointer and expected count
   * 3. Enables RXNE interrupt via __HAL_UART_ENABLE_IT(&huart1, UART_IT_RXNE)
   * 4. Returns immediately (non-blocking)
   *
   * From this point, each received byte triggers USART1_IRQHandler()
   */
  HAL_UART_Receive_IT(&huart1, rxBuffer, sizeof(rxBuffer));

  /* USER CODE END 2 */

  /* Infinite loop */
  while (1)
  {
    /* USER CODE BEGIN 3 */

    if(dataReceivedFlag)
    {
      dataReceivedFlag = 0;  // Clear flag

      /*
       * Process received data in rxBuffer
       * Examples:
       * - Parse protocol messages
       * - Echo back: HAL_UART_Transmit(&huart1, rxBuffer, sizeof(rxBuffer), HAL_MAX_DELAY);
       * - Store in queue for later processing
       * - Toggle LED to indicate reception
       */
      BSP_LED_Toggle(LED_BLUE);

      /* Data processing here... */
    }

    /* USER CODE END 3 */
  }
}
```

## Execution Flow

### Initialization Sequence
1. `main()` calls `MX_USART1_UART_Init()`
2. `HAL_UART_Init(&huart1)` internally calls `HAL_UART_MspInit(&huart1)`
3. MSP init enables clocks, configures pins, enables NVIC
4. `HAL_UART_Receive_IT()` arms the reception state machine
5. RXNE interrupt is now enabled in USART1->CR1 register

### Reception Sequence (Per Byte)
1. Remote device sends byte → UART hardware receives it → stored in USART1->RDR register
2. Hardware sets RXNE flag in USART1->ISR register
3. NVIC signals CPU → jumps to `USART1_IRQHandler()`
4. `HAL_UART_IRQHandler(&huart1)` reads byte from RDR into `rxBuffer[index++]`
5. Reading RDR clears RXNE flag automatically
6. If `index < Size`: interrupt returns, waits for next byte
7. If `index == Size`: calls `HAL_UART_RxCpltCallback(&huart1)`, sets RxState to READY

### After Reception Complete
1. `HAL_UART_RxCpltCallback()` sets `dataReceivedFlag`
2. `HAL_UART_RxCpltCallback()` calls `HAL_UART_Receive_IT()` again (re-arms)
3. Main loop detects flag, processes `rxBuffer[0...9]`
4. System ready for next 10-byte message

## Advanced Techniques

### 1. Variable-Length Messages (IDLE Line Detection)
```c
/* After UART init: */
HAL_UARTEx_ReceiveToIdle_IT(&huart1, rxBuffer, sizeof(rxBuffer));

/* Callback automatically called when line goes idle */
void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
{
  /* Size = actual bytes received (may be less than buffer size) */
  ProcessMessage(rxBuffer, Size);
  HAL_UARTEx_ReceiveToIdle_IT(&huart1, rxBuffer, sizeof(rxBuffer));
}
```

### 2. Error Handling
```c
void HAL_UART_ErrorCallback(UART_HandleTypeDef *huart)
{
  if(huart->Instance == USART1)
  {
    uint32_t error = HAL_UART_GetError(huart);

    if(error & HAL_UART_ERROR_ORE)  // Overrun: data lost, CPU too slow
      /* Handle overrun */;

    if(error & HAL_UART_ERROR_FE)   // Framing: bad stop bit, baud mismatch?
      /* Handle framing error */;

    if(error & HAL_UART_ERROR_PE)   // Parity: noise or wrong parity setting
      /* Handle parity error */;

    /* Restart reception after clearing error */
    HAL_UART_Receive_IT(&huart1, rxBuffer, sizeof(rxBuffer));
  }
}
```

### 3. DMA Alternative (For High Throughput)
For high baud rates (>115200) or high CPU load scenarios, consider DMA:
```c
/* Requires DMA configuration in MSP init */
HAL_UART_Receive_DMA(&huart1, rxBuffer, sizeof(rxBuffer));

/* DMA transfers data without CPU intervention per byte */
/* Callback still fires when transfer completes */
```

## Common Pitfalls

1. **Forgetting to re-enable reception in callback**
   - Symptom: Only first message works
   - Fix: Call `HAL_UART_Receive_IT()` in `HAL_UART_RxCpltCallback()`

2. **Processing data in interrupt context**
   - Symptom: System becomes sluggish, interrupts delayed
   - Fix: Set flag in callback, process in main loop

3. **Buffer overflow**
   - Symptom: Overrun errors (HAL_UART_ERROR_ORE)
   - Fix: Increase buffer size, reduce baud rate, or use DMA

4. **Wrong GPIO AF or pins**
   - Symptom: No reception at all
   - Fix: Verify pin mapping in datasheet/schematic

5. **NVIC priority conflict**
   - Symptom: Erratic behavior, some interrupts missed
   - Fix: Review all interrupt priorities, ensure critical ones have higher priority (lower number)

## Testing Procedure

1. **Build and flash** the modified firmware
2. **Connect** USB-to-UART adapter:
   - Adapter TX → STM32 RX (PB7)
   - Adapter RX → STM32 TX (PB6)
   - GND → GND
3. **Open** serial terminal (e.g., PuTTY, minicom, screen)
   - Baud: 9600
   - Parity: Odd (per `main.c:296`)
   - Data: 8 bits
   - Stop: 1 bit
4. **Send** exactly 10 bytes
5. **Observe** LED_BLUE toggle (indicates callback fired)
6. **Verify** in debugger: set breakpoint in `HAL_UART_RxCpltCallback()`, inspect `rxBuffer`

## References

- **HAL Driver Source**: `app-bbox/Drivers/STM32WBxx_HAL_Driver/Src/stm32wbxx_hal_uart.c`
  - Line 1656: `HAL_UART_IRQHandler()` implementation
  - Line 1642: `HAL_UART_Receive_IT()` implementation

- **Interrupt Definitions**: `app-bbox/Drivers/CMSIS/Device/ST/STM32WBxx/Include/stm32wb55xx.h:117`
  - `USART1_IRQn = 36`

- **Existing UART Config**: `app-bbox/src/main.c:277-323`
  - `MX_USART1_UART_Init()` - current settings: 9600 baud, 8N1 (odd parity)

- **Interrupt Handler File**: `app-bbox/src/stm32wbxx_it.c`
  - Template for adding `USART1_IRQHandler()`

## Summary

This implementation uses the STM32 HAL library's interrupt-driven UART reception mechanism. The key insight is that `HAL_UART_Receive_IT()` is non-blocking: it configures the peripheral and returns immediately. The actual reception happens asynchronously in `USART1_IRQHandler()`, which is triggered by hardware for each received byte. After all bytes arrive, your callback executes, and you must re-arm reception for continuous operation. This pattern offloads the CPU from polling while maintaining responsiveness to incoming data.
