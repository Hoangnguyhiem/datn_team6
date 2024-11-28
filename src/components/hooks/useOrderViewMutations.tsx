import { useMutation, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export const useOrderViewMutations = () => {
    const [messageApi, handleContext] = message.useMessage()
    const queryClient = useQueryClient()
    const navigater = useNavigate()

    const cancelOrder = useMutation({
        mutationFn: async (bill_id: number) => {
            try {
                console.log(bill_id);
                
                await axios.post(`https://beestylel.site/api/client/products/orders/cancel/${bill_id}`,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                })
            } catch (error) {
                throw new Error("Thao tác thất bại!!")
            }
        },
        onSuccess: () => {
            messageApi.open({
                type: "success",
                content: "Hủy đơn hàng thành công",
            }),
            queryClient.invalidateQueries({
                queryKey: ["order"],
            })
        },
        onError: (error) => {
            messageApi.open({
                type: "error",
                content: error.message,
            })
        }
    })
    const evaluateOrder = useMutation({
        mutationFn: async (data: any) => {
            try {
                await axios.post(`https://beestylel.site/api/client/comment/store`, data , {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                })
            } catch (error) {
                throw new Error("Thao tác thất bại!!")
            }
        },
        onSuccess: () => {
            messageApi.open({
                type: "success",
                content: "Đánh giá sản phẩm thành công",
            })
        },
        onError: (error) => {
            messageApi.open({
                type: "error",
                content: error.message,
            })
        }
    })


    return { cancelOrder, evaluateOrder, handleContext}
}