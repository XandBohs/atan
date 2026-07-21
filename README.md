# Atã

Aplicativo multiplataforma para montar fichas de academia, registrar series e acompanhar a evolucao da forca. A mesma conta funcionara em Android, iOS e web, inclusive durante treinos sem conexao.

## Base tecnica

- Expo SDK 56, React Native 0.85 e TypeScript, compativeis com a versao atual do Expo Go.
- Um codigo compartilhado entre Android, iOS e web, com adaptacoes pontuais por plataforma.
- Supabase planejado para autenticacao, PostgreSQL e arquivos.
- Persistencia local e fila de sincronizacao planejadas para o modo offline-first.

## Executar

Requer Node.js 20.19 ou superior.

```bash
npm install
npm run dev
```

Outros alvos:

```bash
npm run android
npm run ios
npm run web
```

## Verificacoes

```bash
npm run typecheck
npm run build:web
```

## Validacao automatica no GitHub

O repositorio executa uma verificacao de CI em `push` e `pull_request`.

A pipeline roda nesta ordem:

```bash
npm run typecheck
npx expo-doctor
npm run build:web
```

O `Expo Doctor` ajuda a identificar incompatibilidades entre dependencias e a versao do SDK Expo antes de um merge.

Pull requests so devem ser aprovados depois que o workflow passar sem erros.

## Estado atual

Este primeiro marco contem a fundacao Expo, a identidade visual inicial e a tela publica de entrada. As regras confirmadas do produto estao documentadas em [`docs/MVP.md`](docs/MVP.md).
