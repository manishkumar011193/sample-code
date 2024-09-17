BIN := $(PWD)/node_modules/.bin
AWS_CREDENTIALS := $(PWD)/.credentials.tmp
REGION := $(or $(AWS_DEFAULT_REGION),$(AWS_DEFAULT_REGION),eu-west-2)

.DEFAULT_GOAL := deploy

define get_aws_account
	
endef

aws/assume_role:
	@aws sts assume-role \
		--region "$(REGION)" \
		--role-arn "arn:aws:iam::$(strip $(call get_aws_account,$(STAGE))):role/terraform-runner-core__inventory_update_service--$(or $(STAGE),$(STAGE),test)" \
		--role-session-name "serverless" > $(AWS_CREDENTIALS);

aws/configure: aws/assume_role
	@aws configure --profile serverless set aws_access_key_id "$$(cat $(AWS_CREDENTIALS) | jq -r ".Credentials.AccessKeyId")";
	@aws configure --profile serverless set aws_secret_access_key "$$(cat $(AWS_CREDENTIALS) | jq -r ".Credentials.SecretAccessKey")";
	@aws configure --profile serverless set aws_session_token "$$(cat $(AWS_CREDENTIALS) | jq -r ".Credentials.SessionToken")";
	@aws configure --profile serverless set region "$(REGION)";

serverless/deploy: aws/configure
	@$(BIN)/serverless deploy --stage $(or $(STAGE),$(STAGE),test) --aws-profile serverless;

cleanup:
	@$(BIN)/rimraf $(AWS_CREDENTIALS);

deploy:  serverless/deploy cleanup
