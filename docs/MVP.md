# Atã — definição do MVP

## Produto

O Atã atende praticantes autônomos de academia. O usuário cria fichas reutilizáveis, inicia treinos a partir delas e confirma cada série realizada. O MVP é privado, em português do Brasil e usa quilogramas.

## Conta e perfil

- Cadastro por e-mail e senha; acesso adicional por Google e Apple.
- Nome, foto, data de nascimento, sexo e peso corporal são opcionais e editáveis.
- A mesma conta sincroniza Android, iOS e web.
- Todo perfil e histórico são privados no MVP.

## Catálogo e fichas

- Catálogo oficial carregado por seed, com aproximadamente 30 exercícios iniciais.
- Exercício: nome, imagem, instruções, tipo (máquina ou livre), músculo principal, músculos secundários e equipamento.
- Usuários não criam exercícios.
- Cada usuário pode criar até 4 fichas, com até 10 exercícios por ficha.
- A ficha define exercícios ordenados e séries com peso e repetições pré-preenchidos.

## Sessão de treino

- Somente uma sessão ativa por dispositivo; ao reabrir o app, ela é retomada.
- A sessão recebe uma cópia da ficha. Alterações durante o treino não modificam a ficha original.
- Cada linha contém exercício, número da série, peso, repetições e confirmação.
- Somente séries confirmadas entram no histórico, volume e recordes. Uma sessão sem séries confirmadas é descartada.
- O tempo é cronometrado automaticamente e pode ser corrigido depois.
- Um cronômetro manual, sem persistência, oferece iniciar, pausar, parar e definir tempo.
- Sessões retroativas permitem escolher ficha, data, hora e duração e editar os valores preenchidos.
- Treinos concluídos podem ser editados ou excluídos, recalculando métricas.

## Evolução

- Histórico cronológico de treinos.
- Gráfico de volume total por treino, somando `peso × repetições` das séries confirmadas.
- Conquistas avulsas no perfil, por exercício:
  - maior carga confirmada;
  - melhor série, calculada por `peso × repetições`.

## Offline e conflitos

- Fichas, sessão ativa e conclusão de treinos funcionam sem internet e sincronizam depois.
- Se dois dispositivos iniciarem sessões offline, ambas são preservadas no histórico após a sincronização.
- A sessão iniciada mais recentemente permanece como ativa.

## Fora do MVP

- Plano pago, cobrança e limites premium.
- Tema claro, libras e outros idiomas.
- Exercícios personalizados e painel administrativo.
- Lembretes e notificações de treino.
- Rede social, ranking e gamificação — previstos para evolução futura.
