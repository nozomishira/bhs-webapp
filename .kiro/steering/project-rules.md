# プロジェクトルール

## AWS 設計原則

- **コスト最優先**: 固定費ゼロを目指す。マネージドサービスのオンデマンド課金・無料枠を最大活用する
- サービス選定: Lambda, DynamoDB (PAY_PER_REQUEST), API Gateway HTTP API, S3, CloudFront, Cognito, Bedrock (AgentCore Managed Harness)
- 不要なリソースは作らない。リザーブドインスタンスやプロビジョンドスループットは使わない
- CloudWatch Logs は保持期間3日（全環境）
- EarlyValidation の問題があるため、CFn で Tags プロパティは使わない
- JWT Authorizer は CFn で定義できない（EarlyValidation バグ）。`auth/setup-authorizer.sh` で管理する

## 技術スタック

- **言語**: Node.js (TypeScript) で統一。Python は使わない
- **ランタイム**: Node.js 24 (Lambda nodejs24.x)
- **フロントエンド**: Next.js (静的エクスポート output: 'export')。S3 + CloudFront で配信
- **IaC**: CloudFormation (YAML)。なるべく CFn で管理。できないものはシェルスクリプト
- **CI/CD**: GitHub Actions (OIDC 認証)
- **モノレポ**: bhs-webapi は npm workspaces で packages/ 配下に複数 Lambda を管理
- **OSSバージョン**: 常に最新 LTS を使用。古いバージョンを使わない

## リポジトリ構成

| リポジトリ | 役割 |
|---|---|
| bhs-webapp | Next.js フロントエンド (静的エクスポート) |
| bhs-webapi | Lambda API モノレポ (packages/quiz-api, chat-api, coach-api, agent-tools) |
| bhs-infra | CloudFormation テンプレート + デプロイスクリプト |

## DynamoDB テーブル

| テーブル | PK | SK | 用途 |
|---|---|---|---|
| bhs-questions | LEVEL#NN | QUESTION#uuid | 問題データ |
| bhs-quiz-sessions | SESSION#uuid | METADATA | クイズ結果（匿名） |
| bhs-chat-sessions | USER#cognitoSub | SESSION#timestamp#uuid | 会話履歴+採点 |
| bhs-user-profiles | COGNITO#cognitoSub | PROFILE | ユーザープロフィール |

## 認証

- Cognito User Pool + Google IdP (PKCE フロー)
- API Gateway の JWT Authorizer で認証
- 認証不要ルート: GET /health, GET /chat/health, GET /levels, GET /questions
- 認証必須ルート: それ以外すべて

## Bedrock / AgentCore

- モデル: Claude Haiku 4.5 (`jp.anthropic.claude-haiku-4-5-20251001-v1:0`)
- AgentCore: Managed Harness（コンテナ不使用、固定費ゼロ）
- Agent 2つ: bhs-chat-agent（会話練習）、bhs-coach-agent（学習コーチ）
- Guardrails: インドネシア語学習トピックに制限
- Memory: coach-agent のみエピソードメモリ有効

## 環境

| 環境 | Prefix | Branch | 備考 |
|---|---|---|---|
| dev | dev-apne1 | develop | 開発環境 |
| test | test-apne1 | test | テスト環境（未構築） |
| prod | prod-apne1 | main | 本番環境（未構築） |

## 注意事項

- リポジトリを増やさない
- 秘密情報は Secrets Manager で管理（Git にコミットしない）
- auth/parameter-*.json は .gitignore 対象
- Next.js の静的エクスポートでは動的ルート [param] は使えない。クエリパラメータ方式を使う
- useSearchParams は Suspense で囲む
