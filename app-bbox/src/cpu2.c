#include "cpu2.h"
#include "tl.h"
#include "shci.h"
#include "shci_tl.h"

/**
 * @brief This function initializes and releases the CPU2 subsystem
 * @param None
 * @retval None
 */
void CPU2_Init() {
  TL_MM_Config_t tl_mm_config;
  const uint32_t AsynchEvtPoolSize = 1024;
  uint8_t AsynchEvtPool[AsynchEvtPoolSize];
  uint8_t BleSpareEvtBuffer[1024];
  uint8_t SystemSpareEvtBuffer[1024];

  SHCI_TL_HciInitConf_t SHci_Tl_Init_Conf;
  uint8_t SystemCmdBuffer[1024];
  uint8_t DummyEvent[1024];

  /**< Reference table initialization */
  TL_Init();

  /**< System channel initialization */
  SHci_Tl_Init_Conf.p_cmdbuffer = (uint8_t*)&SystemCmdBuffer;
  SHci_Tl_Init_Conf.StatusNotCallBack = 0;
  shci_init((void*) DummyEvent, (void*) &SHci_Tl_Init_Conf);

  /**< Memory Manager channel initialization */
  tl_mm_config.p_AsynchEvtPool = AsynchEvtPool;
  tl_mm_config.p_BleSpareEvtBuffer = BleSpareEvtBuffer; /* UNUSED, but kept for future compatibility */
  tl_mm_config.p_SystemSpareEvtBuffer = SystemSpareEvtBuffer; /* UNUSED, but kept for future compatibility, but used by FUS today only */
  tl_mm_config.AsynchEvtPoolSize = AsynchEvtPoolSize;
  TL_MM_Init( &tl_mm_config );

  /**< Release the CPU2 */
  TL_Enable();
}
