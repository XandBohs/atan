# Atã

Aplicativo multiplataforma para montar fichas de academia, registrar séries e acompanhar a evolução da força. A mesma conta funcionará em Android, iOS e web, inclusive durante treinos sem conexão.

## Base técnica

- Expo SDK 57, React Native 0.86 e TypeScript.
- Um código compartilhado entre Android, iOS e web, com adaptações pontuais por plataforma.
- Supabase planejado para autenticação, PostgreSQL e arquivos.
- Persistência local e fila de sincronização planejadas para o modo offline-first.

## Executar

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run web
```

Outros alvos:

```bash
npm run android
npm run ios
```

## Verificações

```bash
npm run typecheck
npm run build:web
```

## Estado atual

Este primeiro marco contém a fundação Expo, a identidade visual inicial e a tela pública de entrada. As regras confirmadas do produto estão documentadas em [`docs/MVP.md`](docs/MVP.md).
