import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { DomainException } from '@/domain/exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const badRequestException = new BadRequestException(exception.message);
    
    response
      .status(badRequestException.getStatus())
      .json(badRequestException.getResponse());
  }
}