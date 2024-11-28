import { joiResolver } from '@hookform/resolvers/joi'
import { useMutation } from '@tanstack/react-query'
import { message } from 'antd'
import axios from 'axios'
import Joi from 'joi'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

type Props = {}
interface TAuth {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    date_of_birth: Date;
    sex: string;
}

const authSchema = Joi.object({
    name: Joi.string().min(5).max(50).required().messages({
        'any.required': 'Tên người nhận là bắt buộc',
        'string.empty': 'Tên không được để trống',
        'string.min': 'Tên người nhận phải có ít nhất 5 ký tự',
        'string.max': 'Tên người nhận không được quá 50 ký tự',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'any.required': 'Email là bắt buộc',
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không hợp lệ',
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
        'any.required': 'Mật khẩu là bắt buộc',
        'string.empty': 'Mật khẩu không được để trống',
        'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
        'string.pattern.base': 'Mật khẩu phải có ít nhất một ký tự in hoa, một ký tự thường, một số và một ký tự đặc biệt',
    }),
    password_confirmation: Joi.any().valid(Joi.ref('password')).required().messages({
        'any.required': 'Xác nhận mật khẩu là bắt buộc',
        'any.only': 'Xác nhận mật khẩu không khớp',
    }),
    date_of_birth: Joi.date()
        .less(new Date()) // Current date
        .greater(new Date(new Date().setFullYear(new Date().getFullYear() - 100))) // 100 years ago
        .required()
        .messages({
            'date.base': 'Ngày sinh không hợp lệ',
            'date.less': 'Ngày sinh không được ở tương lai',
            'date.greater': 'Ngày sinh không hợp lệ',
            'any.required': 'Ngày sinh là bắt buộc',
        }),
    sex: Joi.string().required().messages({
        'string.empty': 'Giới tính là bắt buộc',
        'any.required': 'Ngày sinh là bắt buộc'
    }),
});


const PageSignup = (props: Props) => {

    const [eye, setEye] = useState<boolean>(true)
    const [eyes, setEyes] = useState<boolean>(true)
    const [messageApi, contextHolder] = message.useMessage()
    const navigater = useNavigate()

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<TAuth>({
        resolver: joiResolver(authSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            sex: "",
        }
    })

    const { mutate } = useMutation({
        mutationFn: async (auth: any) => {
            try {
                const use = await axios.post(`http://localhost:8000/api/client/auth/signup`, auth)
                console.log(use);

            } catch (error) {
                throw new Error("Signin Error!!")
            }
        },
        onSuccess: () => {
            messageApi.open({
                type: 'success',
                content: "Đăng ký thành công"
            }),
            reset(),
            setTimeout(() => {
                navigater(`/signin`)
            },2000)
        },
        onError: (error) => {
            messageApi.open({
                type: "error",
                content: error.message,
            })
        }
    })

    const onSubmit = (data: any) => {
        const formattedData = {
            ...data,
            date_of_birth: new Date(data.date_of_birth).toISOString().split('T')[0] // Định dạng thành YYYY-MM-DD
        };
        mutate(formattedData);
    }

    return (
        <main>
            {contextHolder}
            <div className="px-[15px]">
                <div className="my-[32px] max-w-[430px]  mx-auto lg:my-[60px]">

                    <div className="mb-[15px]">
                        <h1 className='text-[16px] font-[700] mb-[16px] lg:text-[20px]'>Thông tin đăng ký</h1>
                        <div className="text-[14px] font-[500]">
                            Đăng ký thành viên và nhận ngay ưu đãi 10% cho đơn hàng đầu tiên
                            <br />
                            Nhập mã:
                            <b>MLBWELCOME</b>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} action="">
                        <div className="">
                            <div className="mt-[24px] flex flex-col w-[100%] text-[14px]">
                                <label className='mb-[8px] font-[500]' htmlFor="">Họ và Tên</label>
                                <input {...register('name', { required: true })} className=' border-[#808080] border-[1px] rounded-[4px] px-[16px] py-[12px]' type="text" placeholder='Họ và tên' />
                                {errors.name && (<span className='italic text-red-500 text-[12px]'>{errors.name.message}</span>)}
                            </div>

                            <div className="relative">
                                <div className="mt-[24px] flex flex-col w-[100%] text-[14px]">
                                    <label className='mb-[8px] font-[500]' htmlFor="">Mật khẩu</label>
                                    <input {...register('password', { required: true })} className='border-[#808080] border-[1px] rounded-[4px] px-[16px] py-[12px]' type={eye ? "password" : "text"} placeholder='Mật khẩu' />
                                    {errors.password && (<span className='italic text-red-500 text-[12px]'>{errors.password.message}</span>)}
                                    <input {...register('password_confirmation', { required: true })} className='mt-[8px] border-[#808080] border-[1px] rounded-[4px] px-[16px] py-[12px]' type={eyes ? "password" : "text"} placeholder='Xác nhận mật khẩu' />
                                    {errors.password_confirmation && (<span className='italic text-red-500 text-[12px]'>{errors.password_confirmation.message}</span>)}
                                </div>
                                <span className="absolute top-[46px] right-[16px] flex">
                                    <svg onClick={() => { setEye(!eye) }} className={eye ? "hidden" : ""} xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none"> <path fillRule="evenodd" clip-rule="evenodd" d="M1.11519 6.00001C1.20691 6.12331 1.32873 6.28226 1.47797 6.46657C1.84654 6.92178 2.37913 7.52769 3.03537 8.13205C3.62687 8.67679 4.30247 9.20518 5.03556 9.62407L5.78593 8.46973C5.04001 7.85777 4.5625 6.94844 4.5625 5.92005C4.5625 4.04333 6.15276 2.56311 8.06243 2.56311C8.55225 2.56311 9.02105 2.66049 9.44739 2.83697L10.0405 1.92451C9.38802 1.66024 8.70251 1.50037 7.99983 1.50037C6.12141 1.50037 4.3657 2.64282 3.03537 3.86798C2.37913 4.47234 1.84654 5.07825 1.47797 5.53346C1.32873 5.71777 1.20691 5.87672 1.11519 6.00001ZM10.9463 2.36584L10.3091 3.34617C11.0721 3.95822 11.5624 4.87802 11.5624 5.92005C11.5624 7.79677 9.9721 9.27699 8.06243 9.27699C7.55887 9.27699 7.07752 9.17407 6.64167 8.98809L5.9399 10.0677C6.59815 10.3366 7.29023 10.4997 7.99983 10.4997C9.87825 10.4997 11.634 9.35721 12.9643 8.13205C13.6205 7.52769 14.1531 6.92178 14.5217 6.46657C14.6709 6.28226 14.7927 6.12331 14.8845 6.00001C14.7927 5.87672 14.6709 5.71777 14.5217 5.53346C14.1531 5.07825 13.6205 4.47234 12.9643 3.86798C12.368 3.31884 11.6863 2.78632 10.9463 2.36584ZM7.19761 8.13284C7.46588 8.22593 7.75686 8.277 8.06243 8.277C9.4664 8.277 10.5624 7.19903 10.5624 5.92005C10.5624 5.24417 10.2563 4.62441 9.76044 4.19022L7.19761 8.13284ZM8.88989 3.69462C8.63204 3.60956 8.35387 3.56311 8.06243 3.56311C6.65847 3.56311 5.5625 4.64108 5.5625 5.92005C5.5625 6.58272 5.85672 7.19143 6.33555 7.6242L8.88989 3.69462ZM15.4997 6.00001C15.9147 5.72125 15.9146 5.72111 15.9145 5.72096L15.9143 5.72055L15.9135 5.7194L15.911 5.71575L15.9024 5.70312C15.895 5.69237 15.8844 5.67701 15.8707 5.65735C15.8432 5.61803 15.8031 5.56149 15.751 5.49017C15.6468 5.34759 15.4944 5.14568 15.2989 4.90418C14.9084 4.42195 14.3427 3.77795 13.6417 3.1324C12.2577 1.85774 10.2634 0.500366 7.99983 0.500366C5.73621 0.500366 3.742 1.85774 2.35793 3.1324C1.65697 3.77795 1.09123 4.42195 0.700781 4.90418C0.505246 5.14568 0.352871 5.34759 0.248677 5.49017C0.196561 5.56149 0.156444 5.61803 0.128955 5.65735C0.115208 5.67701 0.104614 5.69237 0.0972506 5.70312L0.0886363 5.71575L0.0861636 5.7194L0.0853889 5.72055L0.0851174 5.72096C0.0850139 5.72111 0.0849233 5.72125 0.5 6.00001L0.0849233 5.72125C-0.0283078 5.88984 -0.0283078 6.11018 0.0849233 6.27878L0.5 6.00001C0.0849233 6.27878 0.0850139 6.27892 0.0851174 6.27907L0.0853889 6.27947L0.0861636 6.28062L0.0886363 6.28428L0.0972506 6.29691C0.104614 6.30766 0.115208 6.32302 0.128955 6.34268C0.156444 6.38199 0.196561 6.43854 0.248677 6.50985C0.352871 6.65243 0.505246 6.85435 0.700781 7.09585C1.09123 7.57807 1.65697 8.22208 2.35793 8.86763C3.742 10.1423 5.73621 11.4997 7.99983 11.4997C10.2634 11.4997 12.2577 10.1423 13.6417 8.86763C14.3427 8.22208 14.9084 7.57807 15.2989 7.09585C15.4944 6.85435 15.6468 6.65243 15.751 6.50985C15.8031 6.43854 15.8432 6.38199 15.8707 6.34268C15.8844 6.32302 15.895 6.30766 15.9024 6.29691L15.911 6.28428L15.9135 6.28062L15.9143 6.27947L15.9145 6.27907C15.9146 6.27892 15.9147 6.27878 15.4997 6.00001ZM15.4997 6.00001L15.9147 6.27878C16.028 6.11018 16.028 5.88984 15.9147 5.72125L15.4997 6.00001Z" fill="#BCBCBC"></path> </svg>
                                    <svg onClick={() => { setEye(!eye) }} className={eye ? "" : "hidden"} xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none"> <path fillRule="evenodd" clip-rule="evenodd" d="M1.47797 6.46878C1.32866 6.28427 1.20679 6.12516 1.11507 6.00178C1.20679 5.8784 1.32866 5.71929 1.47797 5.53478C1.84649 5.07938 2.379 4.4732 3.03514 3.86859C4.36531 2.64287 6.12071 1.5 7.99871 1.5C9.87672 1.5 11.6321 2.64287 12.9623 3.86859C13.6184 4.4732 14.1509 5.07938 14.5195 5.53478C14.6688 5.71929 14.7906 5.8784 14.8824 6.00178C14.7906 6.12516 14.6688 6.28427 14.5195 6.46878C14.1509 6.92419 13.6184 7.53036 12.9623 8.13498C11.6321 9.36069 9.87672 10.5036 7.99871 10.5036C6.12071 10.5036 4.36531 9.36069 3.03514 8.13498C2.379 7.53036 1.84649 6.92419 1.47797 6.46878ZM15.9124 5.72284C15.9125 5.72299 15.9126 5.72312 15.4974 6.00178C15.9126 6.28044 15.9125 6.28057 15.9124 6.28073L15.9121 6.28113L15.9113 6.28228L15.9089 6.28594L15.9003 6.29857C15.8929 6.30933 15.8823 6.32469 15.8686 6.34436C15.8411 6.38369 15.801 6.44026 15.7489 6.5116C15.6447 6.65424 15.4923 6.85624 15.2968 7.09784C14.9064 7.58027 14.3408 8.22454 13.6399 8.87037C12.2561 10.1455 10.2621 11.5036 7.99871 11.5036C5.7353 11.5036 3.74134 10.1455 2.3575 8.87037C1.65664 8.22454 1.091 7.58027 0.700605 7.09784C0.5051 6.85624 0.35275 6.65424 0.248573 6.5116C0.196466 6.44026 0.156356 6.38369 0.128872 6.34436C0.115128 6.32469 0.104535 6.30933 0.0971734 6.29857L0.088561 6.28594L0.0860889 6.28228L0.0853145 6.28113L0.0850431 6.28073C0.0849397 6.28057 0.0848491 6.28044 0.5 6.00178C0.0848491 5.72312 0.0849397 5.72299 0.0850431 5.72284L0.0853145 5.72243L0.0860889 5.72128L0.088561 5.71763L0.0971734 5.70499C0.104535 5.69423 0.115128 5.67887 0.128872 5.6592C0.156356 5.61987 0.196466 5.5633 0.248573 5.49196C0.35275 5.34932 0.5051 5.14732 0.700605 4.90573C1.091 4.4233 1.65664 3.77902 2.3575 3.1332C3.74134 1.85802 5.7353 0.5 7.99871 0.5C10.2621 0.5 12.2561 1.85802 13.6399 3.1332C14.3408 3.77902 14.9064 4.4233 15.2968 4.90573C15.4923 5.14732 15.6447 5.34932 15.7489 5.49196C15.801 5.5633 15.8411 5.61987 15.8686 5.6592C15.8823 5.67887 15.8929 5.69423 15.9003 5.70499L15.9089 5.71763L15.9113 5.72128L15.9121 5.72243L15.9124 5.72284ZM15.4974 6.00178L15.9126 5.72312C16.0257 5.89167 16.0257 6.11189 15.9126 6.28044L15.4974 6.00178ZM0.0848491 5.72312L0.5 6.00178L0.0848491 6.28044C-0.028283 6.11189 -0.028283 5.89167 0.0848491 5.72312ZM5.6875 6.04639C5.6875 4.76648 6.78354 3.68823 8.18699 3.68823C9.59043 3.68823 10.6865 4.76648 10.6865 6.04639C10.6865 7.32631 9.59043 8.40456 8.18699 8.40456C6.78354 8.40456 5.6875 7.32631 5.6875 6.04639ZM8.18699 2.68823C6.27729 2.68823 4.6875 4.16927 4.6875 6.04639C4.6875 7.92352 6.27729 9.40456 8.18699 9.40456C10.0967 9.40456 11.6865 7.92352 11.6865 6.04639C11.6865 4.16927 10.0967 2.68823 8.18699 2.68823Z" fill="#BCBCBC"></path> </svg>
                                </span>
                                <span className="absolute top-[101px] right-[16px] flex">
                                    <svg onClick={() => { setEyes(!eyes) }} className={eyes ? "hidden" : ""} xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none"> <path fillRule="evenodd" clip-rule="evenodd" d="M1.11519 6.00001C1.20691 6.12331 1.32873 6.28226 1.47797 6.46657C1.84654 6.92178 2.37913 7.52769 3.03537 8.13205C3.62687 8.67679 4.30247 9.20518 5.03556 9.62407L5.78593 8.46973C5.04001 7.85777 4.5625 6.94844 4.5625 5.92005C4.5625 4.04333 6.15276 2.56311 8.06243 2.56311C8.55225 2.56311 9.02105 2.66049 9.44739 2.83697L10.0405 1.92451C9.38802 1.66024 8.70251 1.50037 7.99983 1.50037C6.12141 1.50037 4.3657 2.64282 3.03537 3.86798C2.37913 4.47234 1.84654 5.07825 1.47797 5.53346C1.32873 5.71777 1.20691 5.87672 1.11519 6.00001ZM10.9463 2.36584L10.3091 3.34617C11.0721 3.95822 11.5624 4.87802 11.5624 5.92005C11.5624 7.79677 9.9721 9.27699 8.06243 9.27699C7.55887 9.27699 7.07752 9.17407 6.64167 8.98809L5.9399 10.0677C6.59815 10.3366 7.29023 10.4997 7.99983 10.4997C9.87825 10.4997 11.634 9.35721 12.9643 8.13205C13.6205 7.52769 14.1531 6.92178 14.5217 6.46657C14.6709 6.28226 14.7927 6.12331 14.8845 6.00001C14.7927 5.87672 14.6709 5.71777 14.5217 5.53346C14.1531 5.07825 13.6205 4.47234 12.9643 3.86798C12.368 3.31884 11.6863 2.78632 10.9463 2.36584ZM7.19761 8.13284C7.46588 8.22593 7.75686 8.277 8.06243 8.277C9.4664 8.277 10.5624 7.19903 10.5624 5.92005C10.5624 5.24417 10.2563 4.62441 9.76044 4.19022L7.19761 8.13284ZM8.88989 3.69462C8.63204 3.60956 8.35387 3.56311 8.06243 3.56311C6.65847 3.56311 5.5625 4.64108 5.5625 5.92005C5.5625 6.58272 5.85672 7.19143 6.33555 7.6242L8.88989 3.69462ZM15.4997 6.00001C15.9147 5.72125 15.9146 5.72111 15.9145 5.72096L15.9143 5.72055L15.9135 5.7194L15.911 5.71575L15.9024 5.70312C15.895 5.69237 15.8844 5.67701 15.8707 5.65735C15.8432 5.61803 15.8031 5.56149 15.751 5.49017C15.6468 5.34759 15.4944 5.14568 15.2989 4.90418C14.9084 4.42195 14.3427 3.77795 13.6417 3.1324C12.2577 1.85774 10.2634 0.500366 7.99983 0.500366C5.73621 0.500366 3.742 1.85774 2.35793 3.1324C1.65697 3.77795 1.09123 4.42195 0.700781 4.90418C0.505246 5.14568 0.352871 5.34759 0.248677 5.49017C0.196561 5.56149 0.156444 5.61803 0.128955 5.65735C0.115208 5.67701 0.104614 5.69237 0.0972506 5.70312L0.0886363 5.71575L0.0861636 5.7194L0.0853889 5.72055L0.0851174 5.72096C0.0850139 5.72111 0.0849233 5.72125 0.5 6.00001L0.0849233 5.72125C-0.0283078 5.88984 -0.0283078 6.11018 0.0849233 6.27878L0.5 6.00001C0.0849233 6.27878 0.0850139 6.27892 0.0851174 6.27907L0.0853889 6.27947L0.0861636 6.28062L0.0886363 6.28428L0.0972506 6.29691C0.104614 6.30766 0.115208 6.32302 0.128955 6.34268C0.156444 6.38199 0.196561 6.43854 0.248677 6.50985C0.352871 6.65243 0.505246 6.85435 0.700781 7.09585C1.09123 7.57807 1.65697 8.22208 2.35793 8.86763C3.742 10.1423 5.73621 11.4997 7.99983 11.4997C10.2634 11.4997 12.2577 10.1423 13.6417 8.86763C14.3427 8.22208 14.9084 7.57807 15.2989 7.09585C15.4944 6.85435 15.6468 6.65243 15.751 6.50985C15.8031 6.43854 15.8432 6.38199 15.8707 6.34268C15.8844 6.32302 15.895 6.30766 15.9024 6.29691L15.911 6.28428L15.9135 6.28062L15.9143 6.27947L15.9145 6.27907C15.9146 6.27892 15.9147 6.27878 15.4997 6.00001ZM15.4997 6.00001L15.9147 6.27878C16.028 6.11018 16.028 5.88984 15.9147 5.72125L15.4997 6.00001Z" fill="#BCBCBC"></path> </svg>
                                    <svg onClick={() => { setEyes(!eyes) }} className={eyes ? "" : "hidden"} xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none"> <path fillRule="evenodd" clip-rule="evenodd" d="M1.47797 6.46878C1.32866 6.28427 1.20679 6.12516 1.11507 6.00178C1.20679 5.8784 1.32866 5.71929 1.47797 5.53478C1.84649 5.07938 2.379 4.4732 3.03514 3.86859C4.36531 2.64287 6.12071 1.5 7.99871 1.5C9.87672 1.5 11.6321 2.64287 12.9623 3.86859C13.6184 4.4732 14.1509 5.07938 14.5195 5.53478C14.6688 5.71929 14.7906 5.8784 14.8824 6.00178C14.7906 6.12516 14.6688 6.28427 14.5195 6.46878C14.1509 6.92419 13.6184 7.53036 12.9623 8.13498C11.6321 9.36069 9.87672 10.5036 7.99871 10.5036C6.12071 10.5036 4.36531 9.36069 3.03514 8.13498C2.379 7.53036 1.84649 6.92419 1.47797 6.46878ZM15.9124 5.72284C15.9125 5.72299 15.9126 5.72312 15.4974 6.00178C15.9126 6.28044 15.9125 6.28057 15.9124 6.28073L15.9121 6.28113L15.9113 6.28228L15.9089 6.28594L15.9003 6.29857C15.8929 6.30933 15.8823 6.32469 15.8686 6.34436C15.8411 6.38369 15.801 6.44026 15.7489 6.5116C15.6447 6.65424 15.4923 6.85624 15.2968 7.09784C14.9064 7.58027 14.3408 8.22454 13.6399 8.87037C12.2561 10.1455 10.2621 11.5036 7.99871 11.5036C5.7353 11.5036 3.74134 10.1455 2.3575 8.87037C1.65664 8.22454 1.091 7.58027 0.700605 7.09784C0.5051 6.85624 0.35275 6.65424 0.248573 6.5116C0.196466 6.44026 0.156356 6.38369 0.128872 6.34436C0.115128 6.32469 0.104535 6.30933 0.0971734 6.29857L0.088561 6.28594L0.0860889 6.28228L0.0853145 6.28113L0.0850431 6.28073C0.0849397 6.28057 0.0848491 6.28044 0.5 6.00178C0.0848491 5.72312 0.0849397 5.72299 0.0850431 5.72284L0.0853145 5.72243L0.0860889 5.72128L0.088561 5.71763L0.0971734 5.70499C0.104535 5.69423 0.115128 5.67887 0.128872 5.6592C0.156356 5.61987 0.196466 5.5633 0.248573 5.49196C0.35275 5.34932 0.5051 5.14732 0.700605 4.90573C1.091 4.4233 1.65664 3.77902 2.3575 3.1332C3.74134 1.85802 5.7353 0.5 7.99871 0.5C10.2621 0.5 12.2561 1.85802 13.6399 3.1332C14.3408 3.77902 14.9064 4.4233 15.2968 4.90573C15.4923 5.14732 15.6447 5.34932 15.7489 5.49196C15.801 5.5633 15.8411 5.61987 15.8686 5.6592C15.8823 5.67887 15.8929 5.69423 15.9003 5.70499L15.9089 5.71763L15.9113 5.72128L15.9121 5.72243L15.9124 5.72284ZM15.4974 6.00178L15.9126 5.72312C16.0257 5.89167 16.0257 6.11189 15.9126 6.28044L15.4974 6.00178ZM0.0848491 5.72312L0.5 6.00178L0.0848491 6.28044C-0.028283 6.11189 -0.028283 5.89167 0.0848491 5.72312ZM5.6875 6.04639C5.6875 4.76648 6.78354 3.68823 8.18699 3.68823C9.59043 3.68823 10.6865 4.76648 10.6865 6.04639C10.6865 7.32631 9.59043 8.40456 8.18699 8.40456C6.78354 8.40456 5.6875 7.32631 5.6875 6.04639ZM8.18699 2.68823C6.27729 2.68823 4.6875 4.16927 4.6875 6.04639C4.6875 7.92352 6.27729 9.40456 8.18699 9.40456C10.0967 9.40456 11.6865 7.92352 11.6865 6.04639C11.6865 4.16927 10.0967 2.68823 8.18699 2.68823Z" fill="#BCBCBC"></path> </svg>
                                </span>
                            </div>

                            <div className="mt-[24px] flex flex-col w-[100%] text-[14px]">
                                <label className='mb-[8px] font-[500]' htmlFor="">Email</label>
                                <input {...register('email', { required: true })} className='border-[#808080] border-[1px] rounded-[4px] px-[16px] py-[12px]' type="text" placeholder='Nhập email' />
                                {errors.email && (<span className='italic text-red-500 text-[12px]'>{errors.email.message}</span>)}
                            </div>

                            <div className="mt-[24px] flex flex-col w-[100%] text-[14px]">
                                <label className='mb-[8px] font-[500]' htmlFor="">Ngày sinh</label>
                                <input {...register('date_of_birth', { required: true })} className=' border-[#808080] border-[1px] rounded-[4px] px-[16px] py-[12px] font-[600]' type="date" />
                                {errors.date_of_birth && (<span className='italic text-red-500 text-[12px]'>{errors.date_of_birth.message}</span>)}
                            </div>
                            <div className="flex mt-[20px]">
                                <div className="flex items-center">
                                    <input {...register('sex', { required: true })} value='male' type="radio" name="sex" />
                                    <label className='ml-[5px]' htmlFor="">Nam</label>
                                </div>
                                <div className="flex items-center ml-[20px]">
                                    <input {...register('sex', { required: true })} value='female' type="radio" name="sex" />
                                    <label className='ml-[5px]' htmlFor="">Nữ</label>
                                </div>
                            </div>
                            {errors.sex && (<span className='italic text-red-500 text-[12px]'>{errors.sex.message}</span>)}

                            <div className="flex flex-col w-[100%] text-[16px] mt-[24px]">
                                <button type='submit' className='px-[32px] py-[12px] bg-black text-white rounded-[4px]'>ĐĂNG KÝ</button>
                            </div>
                            
                            <div className="mt-[16px]">
                                <div className="flex justify-center items-center *:text-[14px] *:text-[#787878] *:font-[500]">
                                    <div>Bạn đã có tài khoản?</div>
                                    <span className='mx-[10px]'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2" height="10" viewBox="0 0 2 10" fill="none"> <rect x="0.5" width="1" height="10" fill="#D0D0D0"></rect> </svg>
                                    </span>
                                    <Link to={`/signin`}>Đăng nhập</Link>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="flex justify-evenly my-[32px] *:text-[14px] *:text-[#787878]">
                        <button>
                            <div className="mb-[5px] flex justify-center items-center">
                                <img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRcJCBNNt1a5beIvBpfZ_vM82U1B3AHdou0Pi50225Ng5dtIE_R" alt="" width={40} height={40} />
                            </div>
                            <span>ĐĂNG NHẬP GOOGLE</span>
                        </button>
                        <button>
                            <div className="mb-[5px] flex justify-center items-center">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png" alt="" width={40} height={40} />
                            </div>
                            <span>ĐĂNG NHẬP FACEBOOK</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default PageSignup