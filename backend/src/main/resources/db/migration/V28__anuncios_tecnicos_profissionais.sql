alter table produto_catalogo add column conteudo_publico jsonb not null default '{}'::jsonb;

update produto_catalogo set imagem_url='/equipamentos/betoneira-menegotti-pro.png',conteudo_publico=jsonb_build_object(
 'resumo','Betoneira profissional de 400 litros para preparo recorrente de concreto e argamassa em obras, reformas e serviços de construção.',
 'indicadoPara',jsonb_build_array('Mistura de concreto e argamassa','Obras residenciais e comerciais','Reformas, contrapiso e assentamento'),
 'naoIndicado','Não operar sobre piso instável, sem as proteções instaladas ou em rede elétrica incompatível. Volume nominal da cuba não equivale à carga útil de mistura.',
 'inclui',jsonb_build_array('Betoneira completa','Motor elétrico de 2 CV e 4 polos','Kit elétrico instalado'),
 'cuidados',jsonb_build_array('Instalar em piso firme e nivelado','Conferir tensão e aterramento antes da ligação','Nunca introduzir ferramentas na cuba em movimento','Limpar a cuba após o uso sem molhar motor ou comandos'),
 'observacaoTecnica','Modelo comercial e tensão devem ser confirmados na plaqueta antes da reserva; a documentação recebida confirma marca, volume, motor e kit elétrico.'
) where id='BET001';

update produto_catalogo set imagem_url='/equipamentos/compactador-solo-pro.png',conteudo_publico=jsonb_build_object(
 'resumo','Compactador tipo sapo para compactação confinada de solo em valas, fundações, aterros e recomposição de piso.',
 'indicadoPara',jsonb_build_array('Valas e áreas estreitas','Solo coesivo e aterros em camadas','Preparação de base para pisos e fundações'),
 'naoIndicado','Não é placa vibratória. O resultado depende do solo, umidade, espessura das camadas e número de passadas.',
 'inclui',jsonb_build_array('Compactador de aproximadamente 78 kg','Motor Honda GX100','Carrinho de transporte mostrado na foto'),
 'cuidados',jsonb_build_array('Usar somente em área ventilada','Transportar com combustível fechado e motor frio','Verificar óleo e combustível antes da partida','Operar com botina, proteção auditiva, óculos e luvas'),
 'observacaoTecnica','A ficha Honda confirma para o GX100: 98 cm³, 2,8 hp líquidos a 3.600 rpm, partida retrátil e motor a gasolina de 4 tempos. Marca e modelo do conjunto compactador ainda precisam ser lidos na plaqueta.'
) where id='COM001';

update produto_catalogo set imagem_url='/equipamentos/demolidor-ingco-pro.png',descricao='Martelete demolidor INGCO PDB15006 de 1.500 W, classe de 10 kg, encaixe SDS-MAX e impacto variável de 6 a 25 J.',aplicacao='Demolição pesada de concreto, contrapiso, alvenaria e abertura de canaletas',especificacoes='{"Potência":"1.500 W","Tensão":"220–240 V · 50/60 Hz","Impacto":"6–25 J","Frequência":"1.000–1.900 ipm","Encaixe":"SDS-MAX","Classe de peso":"10 kg","Recursos":"Antivibração · potência constante · trava de cinzel"}'::jsonb,conteudo_publico=jsonb_build_object(
 'resumo','Rompedor pesado para remover concreto, contrapiso e alvenaria com alta energia de impacto e controle eletrônico.',
 'indicadoPara',jsonb_build_array('Quebra de pisos e contrapisos','Demolição de concreto e alvenaria','Abertura de rasgos e remoção de revestimentos resistentes'),
 'naoIndicado','Não possui rotação para perfuração. Não usar como alavanca nem em estrutura sem avaliação técnica.',
 'inclui',jsonb_build_array('Maleta rígida BMC','2 cinzéis SDS-MAX','Jogo extra de escovas de carvão, conforme configuração do fabricante'),
 'cuidados',jsonb_build_array('Isolar a área contra projeção de fragmentos','Usar proteção ocular, respiratória e auditiva','Manter as duas mãos nas empunhaduras','Desligar da tomada antes de trocar o cinzel'),
 'fonte','Fabricante INGCO · PDB15006'
) where id='DEM001';

update produto_catalogo set imagem_url='/equipamentos/martelete-ingco-pro.png',descricao='Martelete perfurador e rompedor INGCO RH150028 de 1.500 W, 5,5 J, encaixe SDS Plus e capacidade de até 32 mm em concreto.',especificacoes='{"Potência":"1.500 W","Tensão":"220–240 V · 50/60 Hz","Energia de impacto":"5,5 J","Impactos":"4.400 ipm","Rotação sem carga":"850 rpm","Capacidade":"Concreto 32 mm · aço 13 mm · madeira 40 mm","Encaixe":"SDS Plus","Recurso":"Sistema antivibração"}'::jsonb,conteudo_publico=jsonb_build_object(
 'resumo','Ferramenta versátil de 5,5 J para perfurar concreto e executar rompimentos de porte leve a médio.',
 'indicadoPara',jsonb_build_array('Furação de concreto e alvenaria','Passagem de tubulação e eletrodutos','Remoção localizada de reboco, revestimento e concreto'),
 'naoIndicado','Para demolição contínua e pesada, prefira o PDB15006 SDS-MAX.',
 'inclui',jsonb_build_array('Maleta rígida BMC','Empunhadura auxiliar','3 brocas e 2 cinzéis, conforme configuração do fabricante'),
 'cuidados',jsonb_build_array('Selecionar o modo correto antes de operar','Usar acessório SDS Plus compatível','Não aplicar esforço lateral na broca ou cinzel','Usar óculos, máscara e proteção auditiva'),
 'fonte','Fabricante INGCO · RH150028'
) where id='MAR001';

update produto_catalogo set imagem_url='/equipamentos/martelo-dewalt-pro.png',descricao='Martelo perfurador/rompedor DeWalt D25133K de 800 W, 2 J e encaixe SDS Plus, com três modos de operação.',especificacoes='{"Potência":"800 W","Energia de impacto":"2 J","Rotação":"0–1.500 rpm","Capacidade":"Concreto 4–26 mm · aço 13 mm · madeira 30 mm","Encaixe":"SDS Plus","Peso":"2,6 kg","Modos":"Perfuração · perfuração com impacto · cinzelamento leve"}'::jsonb,conteudo_publico=jsonb_build_object(
 'resumo','Martelo compacto e controlável para furos de ancoragem e fixação, instalações e cinzelamento leve.',
 'indicadoPara',jsonb_build_array('Furos de 4 a 26 mm em concreto e alvenaria','Instalação de buchas e chumbadores','Cinzelamento leve em tijolo e alvenaria'),
 'naoIndicado','Não substitui martelete demolidor em quebra de piso ou concreto pesado.',
 'inclui',jsonb_build_array('Maleta rígida','Empunhadura lateral multiposição','Limitador de profundidade'),
 'cuidados',jsonb_build_array('Usar a empunhadura lateral','Parar se o acessório travar','Escolher broca SDS Plus adequada ao material','Desconectar antes da troca de acessório'),
 'fonte','Fabricante DeWalt · D25133K'
) where id='FUR001';

update produto_catalogo set imagem_url='/equipamentos/serra-circular-dewalt-pro.png',nome='Serra circular DeWalt DWE560',descricao='Serra circular compacta DeWalt DWE560 de 1.350 W, disco de 184 mm e profundidade máxima de corte de 65 mm a 90°.',especificacoes='{"Potência":"1.350 W","Disco":"184 mm · 7 1/4 pol.","Rotação sem carga":"5.500 rpm","Corte a 90°":"até 65 mm","Corte a 45°":"até 42 mm","Inclinação":"até 48°","Peso":"3,7 kg","Furo do disco":"16 mm"}'::jsonb,conteudo_publico=jsonb_build_object(
 'resumo','Serra circular leve para cortes retos e inclinados em madeira, com soprador da linha de corte e saída para extração de pó.',
 'indicadoPara',jsonb_build_array('Tábuas, compensados e painéis de madeira','Cortes longitudinais e transversais','Cortes inclinados de até 48°'),
 'naoIndicado','Não cortar metal, alvenaria ou materiais incompatíveis com o disco instalado.',
 'inclui',jsonb_build_array('Disco TCT de 184 mm','Guia paralela','Chave de troca do disco','Adaptador para extração de pó'),
 'cuidados',jsonb_build_array('Apoiar e fixar a peça corretamente','Manter a proteção móvel livre','Aguardar o disco parar antes de apoiar a serra','Usar disco correto e dentro da rotação permitida'),
 'fonte','Fabricante DeWalt · DWE560'
) where id='SER001';

update produto_catalogo set imagem_url='/equipamentos/esmerilhadeira-dewalt-pro.png',conteudo_publico=jsonb_build_object(
 'resumo','Esmerilhadeira angular compacta para corte, desbaste e acabamento, compatível com discos de 115 mm conforme a aplicação.',
 'indicadoPara',jsonb_build_array('Corte e desbaste de metais','Remoção de rebarbas e acabamento','Serviços com disco de 4 1/2 pol. compatível'),
 'naoIndicado','Não utilizar sem guarda, sem empunhadura ou com disco inadequado ao material e à rotação.',
 'inclui',jsonb_build_array('Empunhadura lateral','Guarda de proteção','Chave de aperto'),
 'cuidados',jsonb_build_array('Instalar a guarda antes do uso','Verificar validade e integridade do disco','Direcionar faíscas para área segura','Usar proteção facial, auditiva, luvas e vestimenta sem partes soltas'),
 'observacaoTecnica','O código DWE4118 foi confirmado pela embalagem/foto; potência, rotação e tensão devem ser conferidas na plaqueta desta unidade antes da publicação definitiva.'
) where id='ESM001';

update produto_catalogo set imagem_url='/equipamentos/carrinho-mao-pro.png',conteudo_publico=jsonb_build_object(
 'resumo','Carrinho de mão metálico em chapa 18 para movimentação manual de materiais no canteiro.',
 'indicadoPara',jsonb_build_array('Transporte de argamassa, areia e entulho','Movimentação em obra e jardim','Apoio a serviços de reforma'),
 'naoIndicado','Não exceder a capacidade estrutural e não transportar pessoas. Capacidade volumétrica e de carga ainda não foram confirmadas pelo fabricante.',
 'inclui',jsonb_build_array('Caçamba em chapa 18','Estrutura metálica','Uma roda e duas manoplas'),
 'cuidados',jsonb_build_array('Distribuir a carga de forma equilibrada','Evitar rampas e piso instável com carga elevada','Limpar e secar após materiais corrosivos','Usar luvas e calçado de segurança'),
 'observacaoTecnica','Fabricante, capacidade em litros e carga máxima precisam ser confirmados antes de acrescentar esses números ao anúncio.'
) where id='CAR001';
