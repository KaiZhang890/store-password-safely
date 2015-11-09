# store-password-safely
安全存储用户密码解决方案，以iOS + Node.js示例。
望能稍微重视下用户隐私和网络安全。

## 整体流程如下：

- 实现HTTPS服务。
- 客户端实现SSL Pining。
- 客户端对用户输入的password进行哈希运算，sha256(FIXED_SALT + password)。
- 服务端使用Bcrypt算法存储、验证用户输入。

## HTTPS：

### 创建SSL证书，以自签名为例

	openssl genrsa -out privatekey.pem 1024
	openssl req -new -key privatekey.pem -out certrequest.csr
	openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
	
### 启动HTTPS服务

```javascript
var options = {
	key: fs.readFileSync('keys/privatekey.pem'),
	cert: fs.readFileSync('keys/certificate.pem')
};

var app = express();

app.get('/', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ name: 'test' }));
});

var httpsServer = https.createServer(options, app);
httpsServer.listen(8080);
```

如果OS X 下端口被占用

	lsof -i:8080
	kill -9 PID

## SSL Pining：
[通过SSL Pinning提高iOS应用的安全性](http://alvinhu.com/blog/2013/06/26/secure-ios-apps-on-ssl-pinning/)

[iOS安全系列之一：HTTPS](http://oncenote.com/2014/10/21/Security-1-HTTPS/)

从服务端获取SSL Pining需要的证书：

	openssl s_client -connect 127.0.0.1:8080 </dev/null 2>/dev/null | openssl x509 -outform DER > myserver.cer
	
使用AFNetworking:

```objective-c
AFHTTPRequestOperationManager *manager = [AFHTTPRequestOperationManager manager];

AFSecurityPolicy *securityPolicy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeCertificate];
NSString *cerPath = [[NSBundle mainBundle] pathForResource:@"myserver" ofType:@"cer"];
NSData *certData = [NSData dataWithContentsOfFile:cerPath];
securityPolicy.pinnedCertificates = @[certData];
securityPolicy.allowInvalidCertificates = YES;
securityPolicy.validatesDomainName = NO;

manager.securityPolicy = securityPolicy;
```

## sha256(FIXED_SALT + password)：
[NSHash](https://github.com/jerolimov/NSHash)

客户端对用户密码进行哈希运算：

```objective-c
NSString *password = @"123";
password = [[@"FIXED_SALT" stringByAppendingString:password] SHA256];
```
## bcrypt：
[bcrypt-nodejs](https://www.npmjs.com/package/bcrypt-nodejs)

服务端使用Bcrypt算法处理

```javascript
bcrypt.hash("bacon", null, null, function(err, hash) {
    // Store hash in your password DB.
});
 
// Load hash from your password DB.
bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
});
bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
});
```


# License
WTFPL (Do What The Fuck You Want To Public License).

http://www.wtfpl.net