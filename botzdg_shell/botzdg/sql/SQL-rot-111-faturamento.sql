-- rot-111 rotina 111

SELECT * 
FROM table(CAST(FUNC_RESUMOFATURAMENTO(
        75,
        TO_DATE('25/02/2023', 'DD/MM/YYYY'),
        TO_DATE('25/02/2023', 'DD/MM/YYYY'),
        16,       -- TIPOCONSULTA   21-total geral 14-canceladas 25-cobrança 17-deparamento 1-supervisor 16-checkouts
        0,        -- P_TIPOVENDA10  
        1,        -- P_BONIFICACAO  
        0,        -- P_DEVOLUCAO    
        0,        -- P_DESCST       
        0,        -- P_DESCIPI      
        0,        -- P_META         
        0,        -- P_LUCRO_LIQ    
        NULL,     -- P_CONDVENDA    
        0,        -- P_CONSIDTIPOFJ 
        0,        -- P_CONSIDCONSUMIDORFINAL    
        0,        -- P_CONSIDISENTO 
        0,        -- P_CONSIDISENTA 
        0,        -- P_SUPERVMOV    
        0,        -- P_PRAZOADICIONAL   
        NULL,     -- P_ORIGEMPED    
        NULL,     -- P_CODSUPERVISOR    
        NULL,     -- P_CODRCA   
        NULL,     -- P_CODCLI   
        NULL,     -- P_NUMNOTA  
        NULL,     -- P_PLPLANO  
        NULL,     -- P_CODPROD  
        NULL,     -- P_UF   
        NULL,     -- P_CODEPTO  
        NULL,     -- P_CLASSE   
        NULL,     -- P_CODEMITENTE  
        NULL,     -- P_CODFORNEC    
        NULL,     -- P_CODCOB   
        NULL,     -- P_CODRAMO  
        NULL,     -- P_CODSEC   
        0,        -- P_CONSIDERARDEVOLTV8 
        NULL,     -- P_CODGERENTE   
        0,        -- P_DESCVLREPASSE    
        0,        -- P_DESCVLTABELA     
        0,        -- P_CONSIDERANOTASAPROVADAS  
        0,        -- P_DESCONSIDERARCLIVINCFORNEC   
        NULL,     -- P_CODCATEGORIA     
        NULL,     -- P_CODSUBCATEGORIA  
        0,        -- P_CONSIDERACOBRANCATITULOS 
        NULL,     -- P_NUMTRANSVENDA    
        NULL,     -- P_CODFORNECPRINC   
        NULL,     -- P_CODMARCA     
        NULL,     -- P_CODLINHAPROD 
        NULL,     -- P_FILTROCODGERENTE 
        NULL,     -- P_FILTROCODSUPERVISOR  
        NULL,     -- P_FILTROCODUSUR    
        NULL,     -- P_FILTROCODFORNEC  
        NULL,     -- P_FILTROCODFORNECPRINC 
        NULL      -- P_CODRAMOPRINC 
        ) as tabela_faturamento))
