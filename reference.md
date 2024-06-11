To start the redis server,navigate to this
> cd C:\Redis
> redis-server.exe


To access the keys

>cd C:\Redis
>.\redis-cli
> FLUSHALL   -> used to flush all the keys
> KEYS *     -> get all the keys
> TTL key_name   -> get the TTL of key_name