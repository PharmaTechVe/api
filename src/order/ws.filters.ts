import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException, HttpException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: any = host.switchToWs().getData();
    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception.getResponse();
    const details = error instanceof Object ? { ...error } : { message: error };
    client.send(
      JSON.stringify({
        event: 'error',
        data: {
          id: client.id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          rid: data.rid as string,
          ...details,
        },
      }),
    );
  }
}
