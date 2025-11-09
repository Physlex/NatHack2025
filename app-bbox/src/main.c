#include "main.h"

#include <stdint.h>

#include "stm32wb55xx.h"
#include "stm32wbxx_hal_rtc.h"
#include "stm32wbxx_hal_rcc.h"
#include "stm32wbxx_hal_conf.h"
#include "shci_tl.h"
#include "app_debug.h"

#include "lib.h"
#include "bbox_ble.h"
#include "cpu2.h"
#include "fram.h"

#include "sys/panic.h"


//! @note Application definitions.
//! @note Data for the application.

#define RX_BUFFER_SIZE 128
uint8_t aRXBufferUser[RX_BUFFER_SIZE];
uint8_t aRXBufferA[RX_BUFFER_SIZE];
uint8_t aRXBufferB[RX_BUFFER_SIZE];
uint8_t *pBufferReadyForUser;
uint8_t *pBufferReadyForReception;
int uwNbReceivedChars;

COM_InitTypeDef BspCOMInit;
static uint32_t delay = 250;
static uint8_t transmitBuffer[sizeof(complex_t) * NPERSEG];

uint8_t rxBuffer[RX_BUFFER_SIZE];
volatile uint8_t dataReceivedFlag = 0;

UART_HandleTypeDef huart1;
const char *hello = "Hello World!";
const char *double_char = "ab";
const uint16_t double_char_len = 3;
const uint16_t hello_len = 13;


//! @note Function definitions.

void SystemClock_Config(void);
void BlinkNTimes(int n);

static void SYS_ProcessEvent(void);
void PeriphCommonClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_USART1_UART_Init(void);
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart);

/* USER CODE BEGIN PFP */
#if defined(__ICCARM__)
/* New definition from EWARM V9, compatible with EWARM8 */
int iar_fputc(int ch);
#define PUTCHAR_PROTOTYPE int iar_fputc(int ch)
#define GETCHAR_PROTOTYPE int fgetc(FILE *f)
#elif defined (__CC_ARM) || defined(__ARMCC_VERSION)
/* ARM Compiler 5/6 */
#define PUTCHAR_PROTOTYPE int fputc(int ch, FILE *f)
#define GETCHAR_PROTOTYPE int fgetc(FILE *f)
#elif defined(__GNUC__)
int __io_putchar(int ch);
#define PUTCHAR_PROTOTYPE int __io_putchar(int ch)
int __io_getchar(void);
#define GETCHAR_PROTOTYPE int __io_getchar(void)
#endif /* __ICCARM__ */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void) {
    /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
    HAL_Init();

    /* Configure the system clock */
    SystemClock_Config();

    /* Configure the peripherals common clocks */
    PeriphCommonClock_Config();

    /* Initialize all configured peripherals */
    MX_GPIO_Init();
    MX_USART1_UART_Init();

    BSP_PB_Init(BUTTON_SW1, BUTTON_MODE_EXTI);
    BSP_PB_Init(BUTTON_SW2, BUTTON_MODE_EXTI);
    BSP_PB_Init(BUTTON_SW3, BUTTON_MODE_EXTI);

    /* Initialize leds */

    BSP_LED_Init(LED_BLUE);
    BSP_LED_Init(LED_GREEN);
    BSP_LED_Init(LED_RED);

    // Initialize all transport layers
    // CPU2_Init();

    /* Set the red LED On to indicate that the CPU2 is initializing */
    // BSP_LED_On(LED_RED);

    // BSP_LED_On(LED_RED);

    /* Wait until the CPU2 gets initialized */
    // while(
    //     (CPU2_BB_FLAG_GET(APP_State, APP_FLAG_CPU2_INITIALIZED) == 0) ||
    //     (CPU2_BB_FLAG_GET(APP_State, APP_FLAG_WIRELESS_FW_RUNNING) == 0)
    // ) {
    //   /* Process pending SYSTEM event coming from CPU2 (if any) */
    //   SYS_ProcessEvent();
    //   BSP_LED_Toggle(LED_BLUE);
    //   /* HAL_Delay(delay); */
    //   /* SYS_ProcessEvent(); */
    //   /* HAL_Delay(delay); */
    //   BSP_LED_Toggle(LED_BLUE);
    //   /* HAL_Delay(delay); */
    // }

    BSP_LED_On(LED_RED);
    /* Configure the CPU2 Debug (Optional) */
    /* APPD_EnableCPU2(); */

    /* Set the red LED Off to indicate that the CPU2 is initialized */
    BSP_LED_Off(LED_RED);

    /* Set the green LED On to indicate that the wireless stack FW is running */

    /* Initialize COM port */
    BspCOMInit.BaudRate   = 9600;
    BspCOMInit.WordLength = COM_WORDLENGTH_8B;
    BspCOMInit.StopBits   = COM_STOPBITS_1;
    BspCOMInit.Parity     = COM_PARITY_NONE;
    BspCOMInit.HwFlowCtl  = COM_HWCONTROL_NONE;
    if (BSP_COM_Init(COM1, &BspCOMInit) != BSP_ERROR_NONE) {
        Error_Handler();
    }

    /* -- Sample board code to send message over COM1 port ---- */
    fflush (stdout);
    printf(" |-> We're up STM!\n\r");
    fflush (stdout);

    /* -- Sample board code to switch on leds ---- */
    BSP_LED_Off(LED_BLUE);
    BSP_LED_Off(LED_GREEN);
    BSP_LED_Off(LED_RED);

    /* HAL_UART_Receive_IT(&huart1, rxBuffer, sizeof(rxBuffer)); */

    //! @note User code for BLE

    /* ble_pool_t ble_pool; */
    /* ble_init(&ble_pool); */

    /* Output a message on Hyperterminal using printf function */
    printf("\n\r === UART Printf Example === \n\r");

    /* User is prompted to enter characters on terminal input.
       Entered characters are echoed on terminal output until a CR character is entered */
    fflush (stdout);

    printf("\n\r --> Awaiting Commands\n\r");
    fflush (stdout);


    HAL_UART_Receive_IT(&huart1, rxBuffer, RX_BUFFER_SIZE);
    while (1) {
        printf(" --> Awaiting Commands: %sdata recieved\n\r", dataReceivedFlag ? "" : "no ");
        fflush (stdout);
        BSP_LED_Toggle(LED_BLUE);
        HAL_Delay(delay * 8);
        //! @note Buffer a batch of EEG data (two real signals)

        if (dataReceivedFlag) {
            dataReceivedFlag = 0;
            printf("Data received\n\r");
            BSP_LED_Toggle(LED_GREEN);
            HAL_Delay(delay * 4);
        }

        //float32_t *data = 0;
        //const int8_t ble_ec = ble_fill_buffer(&ble_pool, data);
        //if (ble_ec < 0) {
        //    printf("Failed to fill the ble buffer. Reason: %d\n", ble_ec);
        //    break;
        //}

        //////! @note Process the batched data using the rfft.
        //const int8_t spec_res = spectral_rfft((complex_t *)transmitBuffer, data);
        //if (spec_res < 0) {
        //    printf("Failed fourier transform on data\n");
        //    break;
        //}

        //switch (spec_res) {
        //    case SPEC_TRANSFORMED: {
        //        //! @note Alert the system we can now do something with the transmit
        //        //!       data.
        //        /* fram_save(transmitBuffer, sizeof(complex_t) * NPERSEG); */
        //        break;
        //    };

        //    default: {
        //        printf("spectral_rfft: Invalid state %d\n", spec_res);
        //        break;
        //    };
        //}
    }

    /* Error_Handler(); */
}

// void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
// {
//   if(huart->Instance == USART1)
//   {
//     /* Process Size bytes from rxBuffer */
//     printf("Data received!\n\r");
//     dataReceivedFlag = 1;
//
//     /* Re-enable for next message */
//     HAL_UARTEx_ReceiveToIdle_IT(&huart1, rxBuffer, sizeof(rxBuffer));
//   }
// }

/**
  * @brief This function handles USART1 global interrupt.
  */
void USART1_IRQHandler()
{
  /* USER CODE BEGIN USART1_IRQn 0 */
  /* printf("USART1_IRQn\n\r"); */

  /* USER CODE END USART1_IRQn 0 */
  HAL_UART_IRQHandler(&huart1);  // From stm32wbxx_hal_uart.h:1656
  /* USER CODE BEGIN USART1_IRQn 1 */

  /* USER CODE END USART1_IRQn 1 */
}

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
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void) {
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Configure the main internal regulator output voltage
  */
  __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSI|RCC_OSCILLATORTYPE_MSI;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.MSIState = RCC_MSI_ON;
  RCC_OscInitStruct.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
  RCC_OscInitStruct.MSICalibrationValue = RCC_MSICALIBRATION_DEFAULT;
  RCC_OscInitStruct.MSIClockRange = RCC_MSIRANGE_10;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_NONE;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK) {
    Error_Handler();
  }

  /** Configure the SYSCLKSource, HCLK, PCLK1 and PCLK2 clocks dividers
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK4|RCC_CLOCKTYPE_HCLK2
                              |RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_MSI;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.AHBCLK2Divider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.AHBCLK4Divider = RCC_SYSCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_1) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief Peripherals Common Clock Configuration
  * @retval None
  */
void PeriphCommonClock_Config(void)
{
  RCC_PeriphCLKInitTypeDef PeriphClkInitStruct = {0};

  /** Initializes the peripherals clock
  */
  PeriphClkInitStruct.PeriphClockSelection = RCC_PERIPHCLK_SMPS;
  PeriphClkInitStruct.SmpsClockSelection = RCC_SMPSCLKSOURCE_HSI;
  PeriphClkInitStruct.SmpsDivSelection = RCC_SMPSCLKDIV_RANGE0;

  if (HAL_RCCEx_PeriphCLKConfig(&PeriphClkInitStruct) != HAL_OK) {
    Error_Handler();
  }
}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  /* USER CODE BEGIN MX_GPIO_Init_1 */

  /* USER CODE END MX_GPIO_Init_1 */

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();
  __HAL_RCC_GPIOC_CLK_ENABLE();

  /*Configure GPIO pins : USB_DM_Pin USB_DP_Pin */
  GPIO_InitStruct.Pin = USB_DM_Pin|USB_DP_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  GPIO_InitStruct.Alternate = GPIO_AF10_USB;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

  /* USER CODE BEGIN MX_GPIO_Init_2 */

  /* USER CODE END MX_GPIO_Init_2 */
}

/* USER CODE BEGIN 4 */

/**
  * @brief USART1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_USART1_UART_Init(void)
{

  /* USER CODE BEGIN USART1_Init 0 */

  /* BspCOMInit.BaudRate   = 9600; */
  /* BspCOMInit.WordLength = COM_WORDLENGTH_8B; */
  /* BspCOMInit.StopBits   = COM_STOPBITS_1; */
  /* BspCOMInit.Parity     = COM_PARITY_NONE; */
  /* BspCOMInit.HwFlowCtl  = COM_HWCONTROL_NONE; */
  /* USER CODE END USART1_Init 0 */

  /* USER CODE BEGIN USART1_Init 1 */

  /* USER CODE END USART1_Init 1 */
  huart1.Instance = USART1;
  huart1.Init.BaudRate = 9600;
  huart1.Init.WordLength = UART_WORDLENGTH_8B;
  huart1.Init.StopBits = UART_STOPBITS_1;
  huart1.Init.Parity = UART_PARITY_ODD;
  huart1.Init.Mode = UART_MODE_TX_RX;
  huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart1.Init.OverSampling = UART_OVERSAMPLING_16;
  huart1.Init.OneBitSampling = UART_ONE_BIT_SAMPLE_DISABLE;
  huart1.Init.ClockPrescaler = UART_PRESCALER_DIV1;
  huart1.AdvancedInit.AdvFeatureInit = UART_ADVFEATURE_NO_INIT;
  if (HAL_UART_Init(&huart1) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_UARTEx_SetTxFifoThreshold(&huart1, UART_TXFIFO_THRESHOLD_1_8) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_UARTEx_SetRxFifoThreshold(&huart1, UART_RXFIFO_THRESHOLD_1_8) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_UARTEx_DisableFifoMode(&huart1) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN USART1_Init 2 */
  HAL_NVIC_SetPriority(USART1_IRQn, 0, 0);
  HAL_NVIC_EnableIRQ(USART1_IRQn);
  /* USER CODE END USART1_Init 2 */

}
/* USER CODE END 4 */

/**
  * @brief EXTI line detection callback.
  * @param GPIO_Pin: Specifies the pins connected EXTI line
  * @retval None
  */
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
  switch(GPIO_Pin)
  {
    case BUTTON_SW1_PIN:
      /* Change the period to 100 ms */

      BSP_LED_Toggle(LED_RED);
      dataReceivedFlag = 1;
      delay = 100;
      break;
    case BUTTON_SW2_PIN:
      /* Change the period to 500 ms */
      delay = 500;
      break;
    case BUTTON_SW3_PIN:
      /* Change the period to 1000 ms */
      delay = 1000;
      break;
    default:
      break;
  }
}

/**
  * @brief This function handles EXTI line4 interrupt (BUTTON_SW1).
  */
void EXTI4_IRQHandler(void)
{
  HAL_GPIO_EXTI_IRQHandler(BUTTON_SW1_PIN);
}

/**
  * @brief This function handles EXTI line0 interrupt (BUTTON_SW2).
  */
void EXTI0_IRQHandler(void)
{
  HAL_GPIO_EXTI_IRQHandler(BUTTON_SW2_PIN);
}

/**
  * @brief This function handles EXTI line1 interrupt (BUTTON_SW3).
  */
void EXTI1_IRQHandler(void)
{
  HAL_GPIO_EXTI_IRQHandler(BUTTON_SW3_PIN);
}

void BlinkNTimes(int n) {
    for (int i = 0; i < n; i++) {
        BSP_LED_Toggle(LED_GREEN);
        HAL_Delay(delay);
        BSP_LED_Toggle(LED_GREEN);
        HAL_Delay(delay);
    }
}


/**
 * @brief This function is used to process all events coming from BLE stack by executing the related callback
 * @param None
 * @retval None
 */
static void SYS_ProcessEvent(void) {
  /* Process errors first - highest priority */
  if (APP_FLAG_GET(APP_FLAG_CPU2_ERROR) == 1) {
    APP_FLAG_RESET(APP_FLAG_CPU2_ERROR);
    BlinkNTimes(1);
  } else if (APP_FLAG_GET(APP_FLAG_BLE_INITIALIZATION_ERROR) == 1) {
    APP_FLAG_RESET(APP_FLAG_BLE_INITIALIZATION_ERROR);
    BlinkNTimes(2);
  }
  /* Process pending events - high priority */
  else if (APP_FLAG_GET(APP_FLAG_SHCI_EVENT_PENDING) == 1) {
    APP_FLAG_RESET(APP_FLAG_SHCI_EVENT_PENDING);
    shci_user_evt_proc();
    BlinkNTimes(3);
  } else if (APP_FLAG_GET(APP_FLAG_HCI_EVENT_PENDING) == 1) {
    APP_FLAG_RESET(APP_FLAG_HCI_EVENT_PENDING);
    BlinkNTimes(4);
    /* hci_user_evt_proc(); */
  }
  /* Process initialization and state changes - normal priority */
  else if (APP_FLAG_GET(APP_FLAG_CPU2_INITIALIZED) == 1) {
    APP_FLAG_RESET(APP_FLAG_CPU2_INITIALIZED);
    BlinkNTimes(5);
  } else if (APP_FLAG_GET(APP_FLAG_FUS_FW_RUNNING) == 1) {
    APP_FLAG_RESET(APP_FLAG_FUS_FW_RUNNING);
    BlinkNTimes(6);
  } else if (APP_FLAG_GET(APP_FLAG_WIRELESS_FW_RUNNING) == 1) {
    APP_FLAG_RESET(APP_FLAG_WIRELESS_FW_RUNNING);
    BlinkNTimes(7);
  } else if (APP_FLAG_GET(APP_FLAG_BLE_INITIALIZED) == 1) {
    APP_FLAG_RESET(APP_FLAG_BLE_INITIALIZED);
    BlinkNTimes(8);
  } else if (APP_FLAG_GET(APP_FLAG_BLE_ADVERTISING) == 1) {
    APP_FLAG_RESET(APP_FLAG_BLE_ADVERTISING);
    BlinkNTimes(9);
  } else if (APP_FLAG_GET(APP_FLAG_BLE_CONNECTED) == 1) {
    APP_FLAG_RESET(APP_FLAG_BLE_CONNECTED);
    BlinkNTimes(10);
  }
  return;
}

#ifdef USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
