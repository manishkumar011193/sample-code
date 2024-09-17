module.exports = {
  '*': 'prettier --write --ignore-unknown',
  '*.js,*.ts': ['eslint --fix'],
  '*.tf': 'terraform fmt -recursive',
}
