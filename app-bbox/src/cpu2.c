#include "cpu2.h"

#include "app_conf.h"
#include "tl.h"
#include "shci.h"
#include "shci_tl.h"

#include "sys/panic.h"
#include "app/flags.h"


#define TL_BLE_EVENT_FRAME_SIZE ( TL_EVT_HDR_SIZE + CFG_TLBLE_MOST_EVENT_PAYLOAD_SIZE )
#define EVENT_POOL_SIZE (CFG_TLBLE_EVT_QUEUE_LENGTH*4U*DIVC(( sizeof(TL_PacketHeader_t) + TL_BLE_EVENT_FRAME_SIZE ), 4U))


PLACE_IN_SECTION("MB_MEM2") ALIGN(4) static uint8_t EvtPool[EVENT_POOL_SIZE];
PLACE_IN_SECTION("MB_MEM2") ALIGN(4) static TL_CmdPacket_t SystemCmdBuffer;
PLACE_IN_SECTION("MB_MEM2") ALIGN(4) static TL_CmdPacket_t BleCmdBuffer;
PLACE_IN_SECTION("MB_MEM1") ALIGN(4) static uint8_t SystemSpareEvtBuffer[sizeof(TL_PacketHeader_t) + TL_EVT_HDR_SIZE + 255];
PLACE_IN_SECTION("MB_MEM2") ALIGN(4) static uint8_t BleSpareEvtBuffer[sizeof(TL_PacketHeader_t) + TL_EVT_HDR_SIZE + 255];


const uint32_t app_state;


void CPU2_Init() {
    TL_MM_Config_t tl_mm_config;
    SHCI_TL_HciInitConf_t SHci_Tl_Init_Conf;

    /**< Reference table initialization */
    TL_Init();

    /**< System channel initialization */
    SHci_Tl_Init_Conf.p_cmdbuffer = (uint8_t*)&SystemCmdBuffer;
    SHci_Tl_Init_Conf.StatusNotCallBack = SYS_StatusNotificationCallback;
    shci_init(SYS_UserEventReceivedCallback, (void*) &SHci_Tl_Init_Conf);

    /**< Memory Manager channel initialization */
    tl_mm_config.p_AsynchEvtPool = EvtPool;
    tl_mm_config.p_BleSpareEvtBuffer = BleSpareEvtBuffer; /* UNUSED, but kept for future compatibility */
    tl_mm_config.p_SystemSpareEvtBuffer = SystemSpareEvtBuffer; /* UNUSED, but kept for future compatibility, but used by FUS today only */
    tl_mm_config.AsynchEvtPoolSize = EVENT_POOL_SIZE;
    TL_MM_Init( &tl_mm_config );

    /**< Release the CPU2 */
    TL_Enable();
}


void SYS_UserEventReceivedCallback(void * pData) {
    TL_AsynchEvt_t *p_sys_event;
    SHCI_C2_Ready_Evt_t *p_sys_ready_event;
    SCHI_SystemErrCode_t *p_sys_error_code;

    p_sys_event = (TL_AsynchEvt_t*)(((tSHCI_UserEvtRxParam*)pData)->pckt->evtserial.evt.payload);

    /* We have received some event from CPU2, so CPU2 to be considered as running and responding */
    CPU2_BB_FLAG_SET(app_state, APP_FLAG_CPU2_INITIALIZED);

    switch(p_sys_event->subevtcode) {
        case SHCI_SUB_EVT_CODE_READY: {
            p_sys_ready_event = (SHCI_C2_Ready_Evt_t*)p_sys_event->payload;
            if (p_sys_ready_event->sysevt_ready_rsp == WIRELESS_FW_RUNNING) {
                CPU2_BB_FLAG_RESET(app_state, APP_FLAG_FUS_FW_RUNNING);
                CPU2_BB_FLAG_SET(app_state, APP_FLAG_WIRELESS_FW_RUNNING);
            } else if (p_sys_ready_event->sysevt_ready_rsp == FUS_FW_RUNNING) {
                CPU2_BB_FLAG_SET(app_state, APP_FLAG_FUS_FW_RUNNING);
                CPU2_BB_FLAG_RESET(app_state, APP_FLAG_WIRELESS_FW_RUNNING);

                ((tSHCI_UserEvtRxParam *)pData)->status = SHCI_TL_UserEventFlow_Disable;

                /* No RF stack installed most probably */
                Error_Handler(); /* UNEXPECTED */
            } else {
                CPU2_BB_FLAG_SET(app_state, APP_FLAG_CPU2_ERROR);
                Error_Handler(); /* UNEXPECTED */
            }

            break;
        }

        case SHCI_SUB_EVT_ERROR_NOTIF: {
            CPU2_BB_FLAG_SET(app_state, APP_FLAG_CPU2_ERROR);

            p_sys_error_code = (SCHI_SystemErrCode_t*)p_sys_event->payload;
            if (p_sys_error_code == ERR_BLE_INIT) {
                /* Error during BLE stack initialization */
                CPU2_BB_FLAG_SET(app_state, APP_FLAG_BLE_INITIALIZATION_ERROR);
                Error_Handler(); /* UNEXPECTED */
            } else {
                Error_Handler(); /* UNEXPECTED */
            }

            break;
        }

        default: {
            break;
        }
    }

    return;
}


void SYS_StatusNotificationCallback( SHCI_TL_CmdStatus_t status ) {
    UNUSED(status);
    return;
}

